import mongoose, { Types } from "mongoose";
import bcrypt from "bcrypt";
import { connect, disconnect } from "../config/mongoConnection.js";
import { startCron } from "../cron/cron.js";
import { UserModel } from "../models/User.js";
import { BuildingModel } from "../models/Building.js";
import { ReviewModel } from "../models/Review.js";

//REMEMBER, comments are now called topics in "Forum" in buildings
import { CommentModel } from "../models/Comment.js";
import { ReplyModel } from "../models/Reply.js";

import { existsSync, promises as fsPromises } from "node:fs";
import { join } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const hashPassword = (password: string) => bcrypt.hash(password, 10);

const CRON_DIR = join("data", "cron");
const CSV_PATH = join(CRON_DIR, "violations.csv");
const MINIMUM_RELEASE_ROWS = 5000;

const countCsvRows = async (filePath: string): Promise<number> => {
  const content = await fsPromises.readFile(filePath, "utf8");
  if (!content.trim()) return 0;
  return content.trim().split("\n").length - 1;
};

const prepareCsv = async (): Promise<boolean> => {
  if (existsSync(CSV_PATH)) {
    const rowCount = await countCsvRows(CSV_PATH);
    if (rowCount >= MINIMUM_RELEASE_ROWS) {
      console.log(
        `Using existing violations.csv with ${rowCount} rows. Skipping cron and validation queries.`,
      );
      return false;
    }

    console.log(
      `Found violations.csv with ${rowCount} rows, deleting it so the cron can recreate a fresh file.`,
    );
    await fsPromises.unlink(CSV_PATH);
  }

  return true;
};

const promptContinue = async (): Promise<boolean> => {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question("Continue cron job or terminate? (continue/terminate): ");
  rl.close();
  return answer.trim().toLowerCase().startsWith("c");
};

const main = async () => {
  await connect();
  await mongoose.connection.dropDatabase();

  const needsCron = await prepareCsv();

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

  if (!needsCron) {
    console.log(
      "Seeded users, buildings, reviews, and comments. CSV already exists, so no cron ticks were run.",
    );
    await disconnect();
    return;
  }

  console.log(
    "A fresh violations.csv is required. Running first cron tick to pull the initial rows from the API...",
  );
  // TODO This is bugged
  // await tick(false);

  const firstContinue = await promptContinue();
  if (!firstContinue) {
    console.log("Seed complete; terminating after first tick.");
    await disconnect();
    return;
  }

  console.log("Running second cron tick to pull any newer rows...");
  // await tick(false);

  const secondContinue = await promptContinue();
  if (!secondContinue) {
    console.log("Seed complete; terminating after second tick.");
    await disconnect();
    return;
  }

  console.log("Continuing cron job...");
  await startCron();

  await disconnect();
};

main().catch(async (e) => {
  console.error(e);
  await disconnect();
});
