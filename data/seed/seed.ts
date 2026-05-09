import mongoose, { Types } from "mongoose";
import bcrypt from "bcrypt";
import { connect, disconnect } from "../config/mongoConnection.js";
import { tick, startCron } from "../cron/cron.js";
import { UserModel } from "../models/User.js";
import { BuildingModel } from "../models/Building.js";
import { ReviewModel } from "../models/Review.js";
import { CommentModel } from "../models/Comment.js";
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

  const building1Id = new Types.ObjectId();
  const building2Id = new Types.ObjectId();
  const building3Id = new Types.ObjectId();

  const review1Id = new Types.ObjectId();
  const review2Id = new Types.ObjectId();

  const comment1Id = new Types.ObjectId();
  const comment2Id = new Types.ObjectId();

  await UserModel.insertMany([
    {
      _id: adminId,
      firstName: "Super",
      lastName: "User",
      email: "sudo@gmail.com",
      hashedPassword: await hashPassword("superpassword"),
      isAdmin: true,
      activityScore: 10,
      savedBuildings: [building1Id, building2Id], //joined notifications with saved buildings for simplicity
      reviewIds: [review1Id],
      commentIds: [comment2Id],
    },
    {
      _id: userId,
      firstName: "Normal",
      lastName: "User",
      email: "normal@gmail.com",
      hashedPassword: await hashPassword("normalpassword"),
      isAdmin: false,
      activityScore: 5,
      notifications: [{ building2Id: true }], //separate field for notifications
      savedBuildings: [building2Id],
      reviewIds: [review2Id],
      commentIds: [comment1Id],
    },
  ]);

  await BuildingModel.insertMany([
    {
      _id: building1Id,
      address: "179-49 Zoller Road, Queens, NY 11434",
      BIN: 4269660,
      avgRating: 4,
      reviewsCount: 1,
    },
    {
      _id: building2Id,
      address: "178-26 Zoller Road, Queens, NY 11434",
      BIN: 4270016,
      avgRating: 3,
      reviewsCount: 1,
    },
    {
      _id: building3Id,
      address: "178-31 Zoller Road, Queens, NY 11434",
      BIN: 4269997,
      avgRating: 0,
      reviewsCount: 0,
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
  ]);

  await CommentModel.insertMany([
    {
      _id: comment1Id,
      userId: userId,
      buildingId: building1Id,
      reviewId: review1Id,
      topicTitle: "Totally agree with this.",
      timeCreated: new Date(),
    },
    {
      _id: comment2Id,
      userId: adminId,
      buildingId: building2Id,
      reviewId: review2Id,
      topicTitle: "Heard similar complaints.",
      timeCreated: new Date(),
    },
  ]);

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
  await tick(false);

  const firstContinue = await promptContinue();
  if (!firstContinue) {
    console.log("Seed complete; terminating after first tick.");
    await disconnect();
    return;
  }

  console.log("Running second cron tick to pull any newer rows...");
  await tick(false);

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
