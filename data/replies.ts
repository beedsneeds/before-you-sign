import { Types } from "mongoose";
import { ReplyModel, type Reply } from "./models/Reply.js";

export const getRepliesByTopicId = async (topicId: Types.ObjectId): Promise<Reply[]> => {
  const replies = await ReplyModel.find({
    topicId: topicId,
  });

  return replies.map((reply: any) => reply.toObject());
};

export const addReply = async (userId: string, topicId: Types.ObjectId, replyText: string) => {
  if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");

  if (!replyText || typeof replyText !== "string") {
    throw "Reply text must be supplied";
  }

  replyText = replyText.trim();

  if (replyText.length === 0) {
    throw "Reply text cannot be empty";
  }

  if (replyText.length < 5) {
    throw "Reply text must be at least 5 characters";
  }

  const newReply = await ReplyModel.create({
    topicId: topicId,
    replyText: replyText,
    userId: new Types.ObjectId(userId),
    timeCreated: new Date(),
  });

  return newReply;
};
