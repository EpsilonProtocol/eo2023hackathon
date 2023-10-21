import mongoose, { HydratedDocument } from "mongoose";
import { UserSchema, userModel } from "../models/user.model";

export class UserService {
  static getUserFromTwitterId = async (userId: string) => {
    return await userModel.findOne({ "twitter.id": userId });
  };

  static getUserFromId = async (userId: string) => {
    return await userModel.findById(new mongoose.Types.ObjectId(userId));
  };

  static getUserFromWalletAddress = async (address: string) => {
    return await userModel.findOne({ walletAddress: address });
  };

  static createUserWalletAddressIfNotExist = async (address: string) => {
    try {
      const userObj = await userModel.create({ walletAddress: address });

      return userObj;
    } catch (err) {
      console.log("Wallet already exists", address, err);

      return (await userModel.findOne({
        walletAddress: address,
      })) as HydratedDocument<UserSchema>;
    }
  };

  static updateUserTwitter = async (
    user: string,
    twitter: UserSchema["twitter"],
  ) => {
    const userObj = await userModel.findById(new mongoose.Types.ObjectId(user));

    if (!userObj) throw Error("User not found!");

    userObj.twitter = twitter;

    await userObj.save();

    return user;
  };

  static updateUserSafeWalletAddress = async (
    user: string,
    safeWalletAddress: string,
  ) => {
    const userObj = await userModel.findById(new mongoose.Types.ObjectId(user));

    console.log("--user obj", userObj);

    if (!userObj) throw Error("User not found!");

    userObj.safeWalletAddress = safeWalletAddress;

    await userObj.save();

    return user;
  };
}
