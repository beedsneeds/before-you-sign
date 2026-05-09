import { Types } from 'mongoose';
import { ReviewModel, type Review } from './models/Review.js';
import { BuildingModel } from './models/Building.js';

export const getReviewsByBuildingId = async (buildingId: Types.ObjectId): Promise<Review[]> => {
  const reviews = await ReviewModel.find({ buildingId: buildingId });
  return reviews.map((review) => review.toObject());
};

//adding review and update the building stats
export const addReview = async (buildingId: Types.ObjectId, reviewText: string, rating: number) => {
  if (!reviewText) {
    throw 'Review text must be supplied';
  }

  if (typeof reviewText !== 'string') {
    throw 'Review text must be a string';
  }

  reviewText = reviewText.trim();

  if (reviewText.length === 0) {
    throw 'Review text cannot be empty';
  }

  if (reviewText.length < 10) {
    throw 'Review text must be at least 10 characters';
  }

  if (isNaN(rating)) {
    throw 'Rating must be a number';
  }

  if (!Number.isInteger(rating)) {
    throw 'Rating must be a whole number';
  }

  if (rating < 1 || rating > 5) {
    throw 'Rating must be between 1 and 5';
  }
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
