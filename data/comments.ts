import { Types } from 'mongoose';
import { CommentModel, CommentInputSchema, type Comment } from './models/Comment.js';
import { formatZodError } from '../helpers/validation.js';

export const getCommentsByBuildingId = async (buildingId: Types.ObjectId): Promise<Comment[]> => {
  const comments = await CommentModel.find({ buildingId: buildingId }).populate('userId', 'firstName');
  return comments.map((comment: any) => comment.toObject());
};

export const addComment = async (
  buildingId: Types.ObjectId,
  topicTitle: string,
  userId: Types.ObjectId,
) => {
  
  const parsed = CommentInputSchema.safeParse({ buildingId, topicTitle });
  if (!parsed.success) throw formatZodError(parsed.error);

  const newComment = await CommentModel.create({
    buildingId: buildingId,
    topicTitle: topicTitle,
    userId: userId,
    timeCreated: new Date(),
  });

  return newComment;
};
