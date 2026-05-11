import mongoose, { Types } from "mongoose";
import bcrypt from "bcrypt";
import { connect, disconnect } from "../config/mongoConnection.js";
import { SEED_THRESHOLD } from "../cron/cron.js";
import { findNewBuildings } from "../cron/findNewBuildings.js";
import { ingestViolations } from "../cron/ingestViolations.js";
import { UserModel } from "../models/User.js";
import { BuildingModel } from "../models/Building.js";
import { addReview } from "../reviews.js";
import { addComment } from "../comments.js";
import { addReply } from "../replies.js";

//REMEMBER, comments are now called topics in "Forum" in buildings

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

  await UserModel.insertMany([
    {
      _id: adminId,
      firstName: "Super",
      lastName: "User",
      email: "sudo@gmail.com",
      hashedPassword: await hashPassword("superpassword"),
      isAdmin: true,
      activityScore: 0,
      savedBuildings: [building1Id, building2Id],
      notificationPrefs: ["email", "inApp"],
    },
    {
      _id: userId,
      firstName: "Normal",
      lastName: "User",
      email: "normal@gmail.com",
      hashedPassword: await hashPassword("normalpassword"),
      isAdmin: false,
      activityScore: 0,
      savedBuildings: [building2Id],
      notificationPrefs: ["inApp"],
    },

    {
      _id: zm_userId,
      firstName: "Zohran",
      lastName: "Mamdani",
      email: "mayor@zohranfornyc.com",
      hashedPassword: await hashPassword("imthemayor"),
      isAdmin: true,
      activityScore: 0,

      savedBuildings: [],
    },
  ]);

  await BuildingModel.insertMany([
    {
      _id: building1Id,
      address: "179-49 Zoller Road, Queens, NY 11434",
      BIN: 4269660,
    },
    {
      _id: building2Id,
      address: "178-26 Zoller Road, Queens, NY 11434",
      BIN: 4270016,
    },
    {
      _id: building3Id,
      address: "178-31 Zoller Road, Queens, NY 11434",
      BIN: 4269997,
      //avgRating: 0,
      //reviewsCount: 0,
    },

    // BUILDING WITH ASSOCIATED BUILDINGS
    //instructions in main README
    {
      _id: assocBuildId,
      address: "54 Rivington Street, Manhattan, NY 10002",
      BIN: 1005521,
    },
  ]);

  // Use business logic functions to compute building ratings and user activity scores
  await addReview(building1Id, "Great location, but maintenance is slow.", 4, adminId);
  await addReview(building2Id, "Decent place but recurring issues.", 2, userId);
  await addReview(building2Id, "The location is amazing, but it's very crowded.", 4, zm_userId);

  const t1 = await addComment(building1Id, "Did anyone else have no hot water for a week?", userId);
  const t2 = await addComment(building2Id, "How much was your rent increase?", adminId);
  await addComment(building2Id, "Did anyone else have heating issues?", zm_userId);

  await addReply(
    t1._id,
    "Yes, ours was out for 5 days, had to call 311 until landlord responded.",
    adminId,
  );
    await addReply(
    t1._id,
    "What was worse was I didn't have heating for a week during the worst weather we've seen in decades",
    adminId,
  );
  await addReply(t2._id, "Yes, they increased it almost 6%", zm_userId);
  await addReply(t2._id, "They don't tax the rich enough!!!!", zm_userId);
  await addReply(t2._id, "Affordable housing, that's my campaign promise", zm_userId);



  console.log(
    "To test associated buildings, search BIN 199995 or 1005521 (requires NYC.2025-5-1.to.2026-5-1.zip from releases. Rename to violations.csv and place in data/cron/, see cron README)",
  );

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
