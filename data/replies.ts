import { Types } from 'mongoose';
import { ReplyModel, ReplyInputSchema, type Reply } from './models/Reply.js';
import { addKarma, KARMA_PER_CONTRIBUTION } from './users.js';
import { formatZodError } from '../helpers/validation.js';

export const getRepliesByTopicId = async (topicId: Types.ObjectId): Promise<Reply[]> => {
  const replies = await ReplyModel.find({
    topicId: topicId
  }).populate('userId', 'firstName activityScore');

  return replies.map((reply: any) => reply.toObject());
};

export const addReply = async (
  topicId: Types.ObjectId,
  replyText: string,
  userId: Types.ObjectId,
) => {

  const parsed=ReplyInputSchema.safeParse ({topicId, replyText})
  if (!parsed.success) throw formatZodError(parsed.error);

  const newReply = await ReplyModel.create({
    topicId: topicId,
    replyText: parsed.data.replyText,
    userId: userId,
    timeCreated: new Date(),
  });

  await addKarma(userId, KARMA_PER_CONTRIBUTION);

  return newReply;
};
