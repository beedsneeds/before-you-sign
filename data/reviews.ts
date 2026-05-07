import { Types } from 'mongoose';
import { ReviewModel, type Review } from './models/Review.js';
import { BuildingModel } from './models/Building.js';

export const getReviewsByBuildingId = async (buildingId: Types.ObjectId): Promise<Review[]> => {
  const reviews = await ReviewModel.find({ buildingId: buildingId });
  return reviews.map((review) => review.toObject());
};

//adding review and update the building stats
export const addReview = async (buildingId: Types.ObjectId, reviewText: string, rating: number) => {
  const newReview = await ReviewModel.create({
    buildingId: buildingId,
    reviewText: reviewText,
    rating: rating,
    userId: new Types.ObjectId(),
    timeCreated: new Date(),
  });

  // get all reviews for updated avgs
  const allReviews = await ReviewModel.find({
    buildingId: buildingId,
  });

  let totalRating = 0;

  for (const review of allReviews) {
    totalRating += review.rating;
  }
  //calculations
  const avgRating = totalRating / allReviews.length;
  const reviewsCount = allReviews.length;

  // update buildin stats -reviews agg
  await BuildingModel.findByIdAndUpdate(buildingId, {
    avgRating: avgRating,
    reviewsCount: reviewsCount,
  });

  return newReview;
};
