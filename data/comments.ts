import { Types } from 'mongoose';
import { CommentModel, CommentInputSchema, type Comment } from './models/Comment.js';
import { addKarma, KARMA_PER_CONTRIBUTION } from './users.js';
import { formatZodError } from '../helpers/validation.js';

export const getCommentsByBuildingId = async (buildingId: Types.ObjectId): Promise<Comment[]> => {
  const comments = await CommentModel.find({ buildingId: buildingId }).populate('userId', 'firstName activityScore');
  return comments.map((comment: any) => comment.toObject());
};

export const addComment = async (
  buildingId: Types.ObjectId,
  topicTitle: string,
  userId: Types.ObjectId,
) => {
  if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");

  const parsed = CommentInputSchema.safeParse({ buildingId, topicTitle });
  if (!parsed.success) throw formatZodError(parsed.error);

  // Case-insensitive duplicate check so "Hello" and "hello" collide
  const duplicate = await CommentModel.findOne({
    buildingId,
    userId,
    topicTitle: parsed.data.topicTitle,
  }).collation({ locale: 'en', strength: 2 });
  if (duplicate) {
    throw "You already have a topic with this title for this building";
  }

  const newComment = await CommentModel.create({
    buildingId: buildingId,
    topicTitle: parsed.data.topicTitle,
    userId: userId,
    timeCreated: new Date(),
  });

  await addKarma(userId, KARMA_PER_CONTRIBUTION);

  return newComment;
};
