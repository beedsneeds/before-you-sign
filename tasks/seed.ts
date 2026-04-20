import { dbConnection, closeConnection } from "../config/mongoConnection.ts";
import {
  users,
  buildings,
  violations,
  reviews,
  comments,
} from "../config/mongoCollections.ts";
import * as bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

const passwordGenerator = (password: string) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

const main = async () => {
  const db = await dbConnection();
  await db.dropDatabase();

  const usersCollection = await users();
  const buildingsCollection = await buildings();
  const violationsCollection = await violations();
  const reviewsCollection = await reviews();
  const commentsCollection = await comments();

  const hash1 = await passwordGenerator("superpassword");
  const hash2 = await passwordGenerator("normalpassword");

  const userSeedData = [
    {
      UserID: new ObjectId("615f5211445eac188610ecbe"),
      firstName: "Super",
      lastName: "User",
      email: "sudo@gmail.com",
      hashPassword: hash1,
      userReviewsId: ["8c7997a2-c0d2-4f8c-b27a-6a1d4b5b6311"],
      userCommentsId: ["9d7997a2-c0d2-4f8c-b27a-6a1d4b5b6312"],
      savedBuildingsId: [1001, 1002],
      notificationsPreferences: [true, false],
      isAdmin: true,
      activityScore: 25,
    },
    {
      UserID: new ObjectId("615f5211445eac188610ecbe"),
      firstName: "Normal",
      lastName: "User",
      email: "normal@gmail.com",
      hashPassword: hash2,
      userReviewsId: ["8c7997a2-c0d2-4f8c-b27a-6a1d4b5b6311"],
      userCommentsId: ["9d7997a2-c0d2-4f8c-b27a-6a1d4b5b6312"],
      savedBuildingsId: [1001, 1002],
      notificationsPreferences: [true, false],
      isAdmin: false,
      activityScore: 25,
    },
  ];
  const buildingSeedData = [
    {
      BuildingID: 1001,
      Address: "123 Main St, New York, NY 10001",
      AvgRating: 4.2,
      binNumber: 1234567,
      ReviewsCount: 4,
    },
    {
      BuildingID: 1002,
      Address: "124 Main St, New York, NY 10001",
      AvgRating: 4.2,
      binNumber: 1234567,
      ReviewsCount: 4,
    },
  ];
  const violationSeedData = [
    {
      ViolationID: 555001,
      BuildingID: 1001,
      InspectionDate: "2024-10-15T00:00:00.000Z",
      ApprovedDate: "2024-10-20T00:00:00.000Z",
      NewCorrectByDate: "2024-11-01T00:00:00.000Z",
      CertifiedDate: "2024-10-15T00:00:00.000Z",
      OrderNumber: "NOV-12345",
      NOVDescription: "Failure to provide heat in apartment.",
      ViolationStatus: "Open",
      RentImpairing: "Yes",
      ClassCount: [
        {
          Class: "A",
          Count: 2,
        },
        {
          Class: "B",
          Count: 1,
        },
        {
          Class: "C",
          Count: 0,
        },
      ],
    },
    {
      ViolationID: 555001,
      BuildingID: 1002,
      InspectionDate: "2024-10-15T00:00:00.000Z",
      ApprovedDate: "2024-10-20T00:00:00.000Z",
      NewCorrectByDate: "2024-11-01T00:00:00.000Z",
      CertifiedDate: "2024-10-15T00:00:00.000Z",
      OrderNumber: "NOV-12345",
      NOVDescription: "Failure to provide heat in apartment.",
      ViolationStatus: "Open",
      RentImpairing: "Yes",
      ClassCount: [
        {
          Class: "A",
          Count: 2,
        },
        {
          Class: "B",
          Count: 1,
        },
        {
          Class: "C",
          Count: 0,
        },
      ],
    },
  ];
  const reviewSeedData = [
    {
      ReviewID: "8c7997a2-c0d2-4f8c-b27a-6a1d4b5b6311",
      UserID: "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
      BuildingID: "1001",
      ReviewText: "Good location, but landlord takes a while to fix issues.",
      Rating: 4,
      TimeCreated: "2026-04-02T12:00:00.000Z",
    },
    {
      ReviewID: "8c7997a2-c0d2-4f8c-b27a-6a1d4b5b6312",
      UserID: "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
      BuildingID: "1002",
      ReviewText: "Good location, but landlord takes a while to fix issues.",
      Rating: 4,
      TimeCreated: "2026-04-02T12:00:00.000Z",
    },
  ];
  const commentSeedData = [
    {
      CommentID: "9d7997a2-c0d2-4f8c-b27a-6a1d4b5b6312",
      UserID: "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
      BuildingID: "1001",
      userReviewsId: "8c7997a2-c0d2-4f8c-b27a-6a1d4b5b6311",
      CommentText: "I had a similar issue with repairs taking too long.",
      TimeCreated: "2026-04-02T12:30:00.000Z",
    },
    {
      CommentID: "9d7997a2-c0d2-4f8c-b27a-6a1d4b5b6313",
      UserID: "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
      BuildingID: "1002",
      userReviewsId: "8c7997a2-c0d2-4f8c-b27a-6a1d4b5b6311",
      CommentText: "I had a similar issue with repairs taking too long.",
      TimeCreated: "2026-04-02T12:30:00.000Z",
    },
  ];

  await usersCollection.insertMany(userSeedData);
  console.log("Seeded 2 users items");

  await buildingsCollection.insertMany(buildingSeedData);
  console.log("Seeded 2 building items");

  await violationsCollection.insertMany(violationSeedData);
  console.log("Seeded 2 violation items");

  await reviewsCollection.insertMany(reviewSeedData);
  console.log("Seeded 2 review items");

  await commentsCollection.insertMany(commentSeedData);
  console.log("Seeded 2 comment items");

  await closeConnection();
};

main();
