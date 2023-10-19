import mongoose from "mongoose";
import { userModel } from "./user.model";

export type MentionSchema = {
  tweetId: string;
  mentionText: string;
  replyText?: string;
  relatedTxHashes?: string[];
  user: mongoose.Types.ObjectId;
};

const mentionSchema = new mongoose.Schema<MentionSchema>({
  tweetId: {
    type: String,
    required: true,
    unique: true,
  },
  mentionText: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: userModel,
  },
  replyText: {
    type: String,
  },
  relatedTxHashes: [
    {
      type: String,
    },
  ],
});

export const mentionModel = mongoose.model("Mention", mentionSchema);
