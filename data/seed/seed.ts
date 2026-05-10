import mongoose, { Types } from "mongoose";
import bcrypt from "bcrypt";
import { connect, disconnect } from "../config/mongoConnection.js";
import { SEED_THRESHOLD } from "../cron/cron.js";
import { findNewBuildings } from "../cron/findNewBuildings.js";
import { ingestViolations } from "../cron/ingestViolations.js";
import { UserModel } from "../models/User.js";
import { BuildingModel } from "../models/Building.js";
import { ReviewModel } from "../models/Review.js";

//REMEMBER, comments are now called topics in "Forum" in buildings
import { CommentModel } from "../models/Comment.js";
import { ReplyModel } from "../models/Reply.js";

import { existsSync } from "node:fs";
import { join } from "node:path";

const hashPassword = (password: string) => bcrypt.hash(password, 10);

const CSV_PATH = join("data", "cron", "violations.csv");

const main = async () => {
  await connect();
  await mongoose.connection.dropDatabase();

  const adminId = new Types.ObjectId();
  const userId = new Types.ObjectId();
  const zm_userId = new Types.ObjectId();

  const building1Id = new Types.ObjectId();
  const building2Id = new Types.ObjectId();
  const building3Id = new Types.ObjectId();
  const assocBuildId = new Types.ObjectId();

  const review1Id = new Types.ObjectId();
  const review2Id = new Types.ObjectId();
  const review3Id = new Types.ObjectId();

  // "Comment" model is now "Topics" (in name only)
  const topic1Id = new Types.ObjectId();
  const topic2Id = new Types.ObjectId();
  const topic3Id = new Types.ObjectId();

  const reply1Id = new Types.ObjectId();
  const reply2Id = new Types.ObjectId();

  await UserModel.insertMany([
    {
      _id: adminId,
      firstName: "Super",
      lastName: "User",
      email: "sudo@gmail.com",
      hashedPassword: await hashPassword("superpassword"),
      isAdmin: true,
      activityScore: 10,
      savedBuildings: [building1Id, building2Id],
      notificationPrefs: ['email', 'inApp'],
      reviewIds: [review1Id],
      commentIds: [topic2Id],
    },
    {
      _id: userId,
      firstName: "Normal",
      lastName: "User",
      email: "normal@gmail.com",
      hashedPassword: await hashPassword("normalpassword"),
      isAdmin: false,
      activityScore: 5,
      savedBuildings: [building2Id],
      notificationPrefs: ['inApp'],
      reviewIds: [review2Id],
      commentIds: [topic1Id],
    },

    {
      _id: zm_userId,
      firstName: "Zohran",
      lastName: "Mamdani",
      email: "zohran@nyc.com",
      hashedPassword: await hashPassword("zmpassword"),
      isAdmin: false,

      savedBuildings: [],

      reviewIds: [review3Id],
      commentIds: [topic3Id],
    },
  ]);

  await BuildingModel.insertMany([
    {
      _id: building1Id,
      address: "179-49 Zoller Road, Queens, NY 11434",
      BIN: 4269660,
      //avgRating: 4,
      //reviewsCount: 1,
    },
    {
      _id: building2Id,
      address: "178-26 Zoller Road, Queens, NY 11434",
      BIN: 4270016,
      //avgRating: 3,
      //reviewsCount: 1,
    },
    {
      _id: building3Id,
      address: "178-31 Zoller Road, Queens, NY 11434",
      BIN: 4269997,
      //avgRating: 0,
      //reviewsCount: 0,
    },

    // BUILDING WITH LOTS OF ASSOCIATED BUILDINGS
    // Associated Buildings tab population REQUIRES step 1 in data/cron/README.md (violations.csv)
    {
      _id: assocBuildId,
      address: "300 Cherry Street, Manhattan, NY 10002",
      BIN: 1077517,
    },
  ]);

  await ReviewModel.insertMany([
    {
      _id: review1Id,
      userId: adminId,
      buildingId: building1Id,
      rating: 4,
      reviewText: "Great location, but maintenance is slow.",
      timeCreated: new Date(),
    },
    {
      _id: review2Id,
      userId: userId,
      buildingId: building2Id,
      rating: 3,
      reviewText: "Decent place but recurring issues.",
      timeCreated: new Date(),
    },
    {
      _id: review3Id,
      userId: zm_userId,
      buildingId: building2Id,
      rating: 3,
      reviewText: "The location is amazing, but it's very crowded.",
      timeCreated: new Date(),
    },
  ]);

  await CommentModel.insertMany([
    {
      _id: topic1Id,
      userId: userId,
      buildingId: building1Id,
      //reviewId: review1Id,
      topicTitle: "Did anyone else have no hot water for a week?",
      timeCreated: new Date(),
    },
    {
      _id: topic2Id,
      userId: adminId,
      buildingId: building2Id,
      //reviewId: review2Id,
      topicTitle: "How much was your rent increase?",
      timeCreated: new Date(),
    },
    {
      _id: topic3Id,
      userId: zm_userId,
      buildingId: building2Id,
      //reviewId: review2Id,
      topicTitle: "Did anyone else have heating issues?",
      timeCreated: new Date(),
    },
  ]);

  await ReplyModel.insertMany([
    {
      _id: reply1Id,
      topicId: topic1Id,
      userId: adminId,
      replyText: "Yes, ours was out for 5 days, had to call 311 until landlord responded.",
      timeCreated: new Date(),
    },
    {
      _id: reply2Id,
      topicId: topic2Id,
      userId: zm_userId,
      replyText: "Yes, they increased it almost 6%...",
      timeCreated: new Date(),
    },
  ]);

  console.log("To test associated buildings, search BIN 1077517 (requires step 1 in data/cron/README.md)");

  if (existsSync(CSV_PATH)) {
    console.log(`Found ${CSV_PATH}; ingesting violations...`);
    const { total } = await ingestViolations();
    if (total < SEED_THRESHOLD) {
      console.warn(
        `violations.csv had only ${total} rows (< ${SEED_THRESHOLD}); cron will treat this as a cold start and not send out notifications. Retry this process with a larger dataset.`,
      );
    }

    console.log("\nLooking up buildings with recent violations you can subscribe to...");
    await findNewBuildings();
  } else {
    console.log(`No ${CSV_PATH} found; skipping violation ingest.`);
  }

  await disconnect();
};

main().catch(async (e) => {
  console.error(e);
  await disconnect();
});
