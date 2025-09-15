import { User, type IUser } from "../models/UserModel";
import type {
  RegisterInput,
  UpdateProfileInput,
} from "../validator/auth.validator";

export class AuthRepository {
  async createUser(
    userData: Omit<RegisterInput, "confirmPassword">
  ): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select("+password");
  }

  async findUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async findUserById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async findUserByIdWithPassword(id: string): Promise<IUser | null> {
    return await User.findById(id).select("+password");
  }

  async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async updateUserProfile(
    id: string,
    profileData: UpdateProfileInput
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { $set: profileData },
      { new: true, runValidators: true }
    );
  }

  async verifyUser(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );
  }

  async updatePassword(
    id: string,
    hashedPassword: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );
  }

  async deactivateUser(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async activateUser(id: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { isActive: true }, { new: true });
  }

  async incrementReviewCount(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        $inc: { "usageStats.totalReviews": 1 },
        $set: { "usageStats.lastReviewAt": new Date() },
      },
      { new: true }
    );
  }

  async getUserUsageStats(
    userId: string
  ): Promise<{ totalReviews: number; lastReviewAt?: Date } | null> {
    const user = await User.findById(userId).select("usageStats");
    return user?.usageStats || null;
  }

  async checkUserExistence(
    email: string,
    username: string
  ): Promise<{
    emailExists: boolean;
    usernameExists: boolean;
  }> {
    const [emailUser, usernameUser] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);

    return {
      emailExists: !!emailUser,
      usernameExists: !!usernameUser,
    };
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: IUser[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserStats(): Promise<{
    total: number;
    verified: number;
    active: number;
    totalReviews: number;
  }> {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: {
            $sum: {
              $cond: ["$isVerified", 1, 0],
            },
          },
          active: {
            $sum: {
              $cond: ["$isActive", 1, 0],
            },
          },
          totalReviews: {
            $sum: "$usageStats.totalReviews",
          },
        },
      },
    ]);

    return stats[0] || { total: 0, verified: 0, active: 0, totalReviews: 0 };
  }
}
