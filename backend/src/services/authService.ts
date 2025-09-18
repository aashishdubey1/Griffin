import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { AuthRepository } from "../repositories/authRepository";
import type {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validator/auth.validator";
import { type IUser } from "../models/UserModel";

interface JWTPayload {
  userId: string;
  email: string;
}

interface AuthResponse {
  user: Partial<IUser>;
  token: string;
}

// Store for guest review counts and reset tokens
const guestReviewCounts = new Map<string, { count: number; lastReset: Date }>();
const resetTokens = new Map<string, { email: string; expires: Date }>();

export class AuthService {
  private authRepository: AuthRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.authRepository = new AuthRepository();
    this.jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
  }

  async register(userData: RegisterInput): Promise<AuthResponse> {
    const { email, username } = userData;

    // Check if user already exists
    const { emailExists, usernameExists } =
      await this.authRepository.checkUserExistence(email, username);

    if (emailExists) {
      throw new Error("Email is already registered");
    }

    if (usernameExists) {
      throw new Error("Username is already taken");
    }

    // Create user (password will be hashed by the pre-save middleware)
    const user = await this.authRepository.createUser({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      profile: userData.profile,
    });

    const token = this.generateToken({
      userId: user.id as string,
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(loginData: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user by email
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is deactivated. Please contact support.");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = this.generateToken({
      userId: user._id as string,
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async changePassword(
    userId: string,
    passwordData: ChangePasswordInput
  ): Promise<void> {
    const user = await this.authRepository.findUserByIdWithPassword(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(
      passwordData.currentPassword
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, salt);

    await this.authRepository.updatePassword(userId, hashedNewPassword);
  }

  async updateProfile(
    userId: string,
    profileData: UpdateProfileInput
  ): Promise<Partial<IUser>> {
    const updatedUser = await this.authRepository.updateUserProfile(
      userId,
      profileData
    );
    if (!updatedUser) {
      throw new Error("User not found");
    }

    return this.sanitizeUser(updatedUser);
  }

  async getUserProfile(userId: string): Promise<Partial<IUser>> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.sanitizeUser(user);
  }

  async verifyEmail(userId: string): Promise<void> {
    const user = await this.authRepository.verifyUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
  }

  async forgotPassword(forgotData: ForgotPasswordInput): Promise<string> {
    const user = await this.authRepository.findUserByEmail(forgotData.email);
    if (!user) {
      throw new Error("No account found with this email address");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token (in production, store this in database)
    resetTokens.set(resetToken, {
      email: forgotData.email,
      expires,
    });

    return resetToken;
  }

  async resetPassword(resetData: ResetPasswordInput): Promise<void> {
    const tokenData = resetTokens.get(resetData.token);
    if (!tokenData || tokenData.expires < new Date()) {
      resetTokens.delete(resetData.token);
      throw new Error("Invalid or expired reset token");
    }

    const user = await this.authRepository.findUserByEmail(tokenData.email);
    if (!user) {
      throw new Error("User not found");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(resetData.newPassword, salt);

    await this.authRepository.updatePassword(
      user._id as string,
      hashedPassword
    );

    // Remove used token
    resetTokens.delete(resetData.token);
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  // Guest review tracking
  canGuestReview(ipAddress: string): {
    canReview: boolean;
    reviewsLeft: number;
  } {
    const today = new Date().toDateString();
    const guestData = guestReviewCounts.get(ipAddress);

    if (!guestData || guestData.lastReset.toDateString() !== today) {
      // Reset count for new day or new IP
      guestReviewCounts.set(ipAddress, { count: 0, lastReset: new Date() });
      return { canReview: true, reviewsLeft: 2 };
    }

    const reviewsLeft = Math.max(0, 2 - guestData.count);
    return { canReview: reviewsLeft > 0, reviewsLeft };
  }

  incrementGuestReview(ipAddress: string): void {
    const guestData = guestReviewCounts.get(ipAddress);
    if (guestData) {
      guestData.count += 1;
      guestReviewCounts.set(ipAddress, guestData);
    } else {
      guestReviewCounts.set(ipAddress, { count: 1, lastReset: new Date() });
    }
  }

  async incrementUserReview(userId: string): Promise<void> {
    await this.authRepository.incrementReviewCount(userId);
  }

  async canUserReview(
    userId: string
  ): Promise<{ canReview: boolean; reviewsLeft: number }> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const usageStats = user.usageStats || { totalReviews: 0 };
    const reviewsLeft = Math.max(0, user.reviewLimit - usageStats.totalReviews);

    return { canReview: reviewsLeft > 0, reviewsLeft };
  }

  private generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret);
  }

  private sanitizeUser(user: IUser): Partial<IUser> {
    const userObj = user.toJSON();
    delete userObj.password;
    return userObj;
  }

  // Cleanup methods for production use
  cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of resetTokens.entries()) {
      if (data.expires < now) {
        resetTokens.delete(token);
      }
    }
  }

  cleanupOldGuestData(): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    for (const [ip, data] of guestReviewCounts.entries()) {
      if (data.lastReset < yesterday) {
        guestReviewCounts.delete(ip);
      }
    }
  }
}
