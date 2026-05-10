import { Types } from "mongoose";
import { CommentModel, type Comment } from "./models/Comment.js";

export const getCommentsByBuildingId = async (buildingId: Types.ObjectId): Promise<Comment[]> => {
  const comments = await CommentModel.find({ buildingId: buildingId });
  return comments.map((comment: any) => comment.toObject());
};

export const addComment = async (
  userId: string,
  buildingId: Types.ObjectId,
  topicTitle: string,
) => {
  if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  if (!topicTitle || typeof topicTitle !== "string") {
    throw "Topic title must be supplied";
  }

  topicTitle = topicTitle.trim();

  if (topicTitle.length === 0) {
    throw "Topic title cannot be empty";
  }

  if (topicTitle.length < 5) {
    throw "Topic title must be at least 5 characters";
  }

  const newComment = await CommentModel.create({
    buildingId: buildingId,
    topicTitle: topicTitle,
    userId: new Types.ObjectId(userId),
    timeCreated: new Date(),
  });

  return newComment;
};
