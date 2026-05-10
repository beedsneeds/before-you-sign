import * as z from "zod";
import { Types } from "mongoose";
import { ReviewModel, ReviewInputSchema, type Review } from "./models/Review.js";
import { BuildingModel } from "./models/Building.js";
import { formatZodError } from "../helpers/validation.js";

const AddReviewSchema = ReviewInputSchema.pick({ rating: true }).extend({
  reviewText: z.string().trim().min(10).max(2000),
});

export const getReviewsByBuildingId = async (buildingId: Types.ObjectId): Promise<Review[]> => {
  const reviews = await ReviewModel.find({ buildingId: buildingId });
  return reviews.map((review) => review.toObject());
};

//adding review and update the building stats
export const addReview = async (
  //rahim
  userId: string,
  buildingId: Types.ObjectId,
  reviewText: string,
  rating: number,
) => {
  //rahim
  if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  const parsed = AddReviewSchema.safeParse({ reviewText, rating });
  if (!parsed.success) throw formatZodError(parsed.error);

  //rahim
  const userObjectId = new Types.ObjectId(userId);

  const existingReview = await ReviewModel.findOne({
    userId: userObjectId,
    buildingId,
  });
  if (existingReview) {
    throw "You have already reviewd this building";
  }
  //

  const newReview = await ReviewModel.create({
    buildingId: buildingId,
    reviewText: parsed.data.reviewText,
    rating: parsed.data.rating,
    userId: userObjectId,
    timeCreated: new Date(),
  });

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

  return newReview;
};
