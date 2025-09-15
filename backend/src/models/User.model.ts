import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

interface IUserProfile {
  name?: string;
  avatar?: string;
  bio?: string;
}

interface IUserUsageStats {
  totalReviews: number;
  lastReviewAt?: Date;
}

export interface IUser {
  username: string;
  email: string;
  password?: string;
  profile?: IUserProfile;
  isVerified: boolean;
  isActive: boolean;
  reviewLimit: number;
  usageStats?: IUserUsageStats;
}

interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v: string) =>
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v),
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profile: {
      name: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      avatar: {
        type: String,
        default: null,
      },
      bio: {
        type: String,
        maxlength: 200,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reviewLimit: {
      type: Number,
      default: 100,
    },
    usageStats: {
      totalReviews: {
        type: Number,
        default: 0,
      },
      lastReviewAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Indexes remain the same
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ "usageStats.lastReviewAt": -1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    return error instanceof Error ? next(error) : new Error("Hashing failed");
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password as string);
};

export const User = model<IUser>("User", userSchema);
