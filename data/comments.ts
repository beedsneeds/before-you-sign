import { Types } from 'mongoose';
import { CommentModel, type Comment } from './models/Comment.js';

export const getCommentsByBuildingId = async (buildingId: Types.ObjectId): Promise<Comment[]> => {
  const comments = await CommentModel.find({ buildingId: buildingId });
  return comments.map((comment: any) => comment.toObject());
};