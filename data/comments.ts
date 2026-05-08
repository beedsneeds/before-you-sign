import { Types } from 'mongoose';
import { CommentModel, type Comment } from './models/Comment.js';

export const getCommentsByBuildingId = async (buildingId: Types.ObjectId): Promise<Comment[]> => {
  const comments = await CommentModel.find({ buildingId: buildingId });
  return comments.map((comment: any) => comment.toObject());
};

export const addComment = async (buildingId: Types.ObjectId, commentText: string) => {
  if (!commentText || typeof commentText !== 'string') {
    throw 'Comment text must be supplied';
  }

  commentText = commentText.trim();

  if (commentText.length === 0) {
    throw 'Comment text cannot be empty';
  }
  const newComment = await CommentModel.create({
    buildingId: buildingId,
    commentText: commentText,
    userId: new Types.ObjectId(),
    timeCreated: new Date(),
  });

  return newComment;
};
