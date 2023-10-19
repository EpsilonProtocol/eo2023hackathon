import mongoose from "mongoose";
import { mentionModel } from "../models/mention.model";

export class MentionService {
    static getMention = async (tweetId: string) => {
        const mention = await mentionModel.findOne({ tweetId: tweetId });

        return mention;
    };

    static createMention = async (tweetId: string, user: mongoose.Types.ObjectId | mongoose.Document, mentionText: string, replyText?: string, txHashes?: string[]) => {
        const mention = await mentionModel.create({tweetId, user, mentionText, replyText, relatedTxHashes: txHashes})

        return mention
    }
}
