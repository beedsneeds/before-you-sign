import { Types } from 'mongoose';
import { ReplyModel, type Reply } from './models/Reply.js';

export const getRepliesByTopicId = async (
  topicId: Types.ObjectId
): Promise<Reply[]> => {

  const replies = await ReplyModel.find({
    topicId: topicId
  });

  return replies.map((reply: any) => reply.toObject());

};

export const addReply = async (
  topicId: Types.ObjectId,
  replyText: string
) => {

  if (!replyText || typeof replyText !== 'string') {
    throw 'Reply text must be supplied';
  }

  replyText = replyText.trim();

  if (replyText.length === 0) {
    throw 'Reply text cannot be empty';
  }

  if (replyText.length < 5) {
    throw 'Reply text must be at least 5 characters';
  }

  const newReply = await ReplyModel.create({
    topicId: topicId,
    replyText: replyText,
    userId: new Types.ObjectId(),
    timeCreated: new Date(),
  });

  return newReply;

};

