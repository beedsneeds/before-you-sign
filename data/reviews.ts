import { Types } from 'mongoose';
import { ReviewModel, type Review } from './models/Review.js';

export const getReviewsByBuildingId = async (buildingId: Types.ObjectId): Promise<Review[]> => {
  const reviews = await ReviewModel.find({ buildingId: buildingId });
  return reviews.map((review) => review.toObject());
};

export const addReview = async (
  buildingId: Types.ObjectId,
  reviewText: string,
  rating: number
) => {
  const newReview = await ReviewModel.create({
    buildingId: buildingId,
    reviewText: reviewText,
    rating: rating,
    userId: new Types.ObjectId(),
    timeCreated: new Date(),
  });

  return newReview;
};