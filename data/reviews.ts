import * as z from "zod";
import { Types } from "mongoose";
import { ReviewModel, type Review } from "./models/Review.js";
import { BuildingModel } from "./models/Building.js";
import { addKarma, KARMA_PER_CONTRIBUTION } from "./users.js";
import { formatZodError } from "../helpers/validation.js";

export const AddReviewSchema = z.object({
  reviewText: z
    .string()
    .trim()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review cannot be more than 2000 characters'),
  rating: z.coerce
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
});

export const getReviewsByBuildingId = async (buildingId: Types.ObjectId): Promise<Review[]> => {
  const reviews = await ReviewModel.find({ buildingId: buildingId }).populate('userId', 'firstName activityScore');
  return reviews.map((review) => review.toObject());
};

export const getReviewByUserAndBuilding = async (
  userId: Types.ObjectId,
  buildingId: Types.ObjectId,
): Promise<Review | null> => {
  const review = await ReviewModel.findOne({ userId, buildingId });
  return review ? review.toObject() : null;
};
// each user gets one review per building. if one already exists, this updates it
export const addReview = async (
  buildingId: Types.ObjectId,
  reviewText: string,
  rating: number,
  userId: Types.ObjectId,
) => {
  if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");

  const parsed = AddReviewSchema.safeParse({ reviewText, rating });
  if (!parsed.success) throw formatZodError(parsed.error);

  const existingReview = await ReviewModel.findOne({ userId, buildingId });

  let savedReview;
  if (existingReview) {
    existingReview.reviewText = parsed.data.reviewText;
    existingReview.rating = parsed.data.rating;
    await existingReview.save();
    savedReview = existingReview;
  } else {
    savedReview = await ReviewModel.create({
      buildingId: buildingId,
      reviewText: parsed.data.reviewText,
      rating: parsed.data.rating,
      userId: userId,
      timeCreated: new Date(),
    });
  }

  const allReviews = await ReviewModel.find({ buildingId: buildingId });

  let totalRating = 0;
  for (const review of allReviews) {
    totalRating += review.rating;
  }
  const avgRating = totalRating / allReviews.length;
  const reviewsCount = allReviews.length;

  await BuildingModel.findByIdAndUpdate(buildingId, {
    avgRating: avgRating,
    reviewsCount: reviewsCount,
  });

  if (!existingReview) {
    await addKarma(userId, KARMA_PER_CONTRIBUTION);
  }

  return savedReview;
};
