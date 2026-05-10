import { Types } from 'mongoose';
import { ReplyModel, ReplyInputSchema, type Reply } from './models/Reply.js';

export const getRepliesByTopicId = async (
  topicId: Types.ObjectId
): Promise<Reply[]> => {

  const replies = await ReplyModel.find({
    topicId: topicId
  }).populate('userId', 'firstName');

  return replies.map((reply: any) => reply.toObject());

};

export const addReply = async (
  topicId: Types.ObjectId,
  replyText: string,
  userId: Types.ObjectId,
) => {

  const parsed=ReplyInputSchema.safeParse ({topicId, replyText})
  if (!parsed.success) throw parsed.error.flatten()

  const newReply = await ReplyModel.create({
    topicId: topicId,
    replyText: parsed.data.replyText,
    userId: userId,
    timeCreated: new Date(),
  });

  return newReply;

};

