import mongoose from "mongoose";

export type UserSchema = {
  twitter?: {
    id: string;
    name: string;
    username: string;
    accessToken: string;
    refreshToken?: string;
    expiryDate: Date;
  };
  loginNonce: number;
  walletAddress: string;
  safeWalletAddress?: string;
};

const userSchema = new mongoose.Schema<UserSchema>({
  twitter: {
    id: {
      type: String,
    },
    name: {
      type: String,
    },
    username: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  safeWalletAddress: {
    type: String,
  },
  loginNonce: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const userModel = mongoose.model("User", userSchema);
