import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { users, buildings, violations, reviews, comments } from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

const main = async () => {
  const db = await dbConnection();
  await db.dropDatabase();

  const usersCol = await users();
  const buildingsCol = await buildings();
  const violationsCol = await violations();
  const reviewsCol = await reviews();
  const commentsCol = await comments();

  const adminId = new ObjectId();
  const userId = new ObjectId();

  const building1Id = new ObjectId();
  const building2Id = new ObjectId();
  const building3Id = new ObjectId();

  const review1Id = new ObjectId();
  const review2Id = new ObjectId();

  const comment1Id = new ObjectId();
  const comment2Id = new ObjectId();

  const userSeedData = [
    {
      _id: adminId,
      firstName: 'Super',
      lastName: 'User',
      email: 'sudo@gmail.com',
      hashedPassword: await hashPassword('superpassword'),
      isAdmin: true,
      activityScore: 10,
      savedBuildings: [{ building1Id: true }, { building2Id: false }], //joined notifications with saved buildings for simplicity
      reviewIds: [review1Id],
      commentIds: [comment1Id],
    },
    {
      _id: userId,
      firstName: 'Normal',
      lastName: 'User',
      email: 'normal@gmail.com',
      hashedPassword: await hashPassword('normalpassword'),
      isAdmin: false,
      activityScore: 5,
      notifications: [{ building2Id: true }], //separate field for notifications
      savedBuildings: [building2Id],
      reviewIds: [review2Id],
      commentIds: [comment2Id],
    },
  ];

  const buildingSeedData = [
    {
      _id: building1Id,
      address: '179-49 Zoller Road, Queens, NY 11434',
      borough: 'QUEENS',
      bin: 4269660,
      avgRating: 4,
      reviewCount: 1,
    },
    {
      _id: building2Id,
      address: '178-26 Zoller Road, Queens, NY 11434',
      borough: 'QUEENS',
      bin: 4270016,
      avgRating: 3,
      reviewCount: 1,
    },
    {
      _id: building3Id,
      address: '178-31 Zoller Road, Queens, NY 11434',
      borough: 'QUEENS',
      bin: 4269997,
      avgRating: 0,
      reviewCount: 0,
    },
  ];

  const violationSeedData = [
    {
      _id: new ObjectId(),
      buildingId: building1Id,
      violationId: 17537265,
      inspectionDate: new Date('2024-12-05'),
      approvedDate: new Date('2024-12-05'),
      orderNumber: '780',
      novDescription: 'Owner failed to file valid registration statement',
      currentStatus: 'VIOLATION DISMISSED',
      violationStatus: 'Close',
      rentImpairing: 'N',
      class: 'I',
    },
    {
      _id: new ObjectId(),
      buildingId: building1Id,
      violationId: 13668446,
      inspectionDate: new Date('2020-04-28'),
      approvedDate: new Date('2020-04-28'),
      orderNumber: '867',
      novDescription: 'Rodent infestation (rats)',
      currentStatus: 'VIOLATION CLOSED',
      violationStatus: 'Close',
      rentImpairing: 'N',
      class: 'C',
    },

    {
      _id: new ObjectId(),
      buildingId: building2Id,
      violationId: 17421549,
      inspectionDate: new Date('2024-11-11'),
      approvedDate: new Date('2024-11-19'),
      orderNumber: '1061',
      novDescription: 'Illegal plumbing fixtures in cellar',
      currentStatus: 'NOV SENT OUT',
      violationStatus: 'Open',
      rentImpairing: 'N',
      class: 'B',
    },
    {
      _id: new ObjectId(),
      buildingId: building2Id,
      violationId: 17507141,
      inspectionDate: new Date('2024-11-29'),
      approvedDate: new Date('2024-12-02'),
      orderNumber: '1067',
      novDescription: 'Premises vacated by department',
      currentStatus: 'INFO NOV SENT OUT',
      violationStatus: 'Open',
      rentImpairing: 'N',
      class: 'I',
    },

    {
      _id: new ObjectId(),
      buildingId: building3Id,
      violationId: 13909544,
      inspectionDate: new Date('2020-11-20'),
      approvedDate: new Date('2020-11-26'),
      orderNumber: '1061',
      novDescription: 'Illegal cellar living space',
      currentStatus: 'NOV SENT OUT',
      violationStatus: 'Open',
      rentImpairing: 'N',
      class: 'B',
    },
  ];

  const reviewSeedData = [
    {
      _id: review1Id,
      userId: adminId,
      buildingId: building1Id,
      rating: 4,
      reviewText: 'Great location, but maintenance is slow.',
      createdAt: new Date(),
    },
    {
      _id: review2Id,
      userId: userId,
      buildingId: building2Id,
      rating: 3,
      reviewText: 'Decent place but recurring issues.',
      createdAt: new Date(),
    },
  ];

  const commentSeedData = [
    {
      _id: comment1Id,
      userId: userId,
      reviewId: review1Id,
      commentText: 'Totally agree with this.',
      createdAt: new Date(),
    },
    {
      _id: comment2Id,
      userId: adminId,
      reviewId: review2Id,
      commentText: 'Heard similar complaints.',
      createdAt: new Date(),
    },
  ];

  await usersCol.insertMany(userSeedData);
  await buildingsCol.insertMany(buildingSeedData);
  await violationsCol.insertMany(violationSeedData);
  await reviewsCol.insertMany(reviewSeedData);
  await commentsCol.insertMany(commentSeedData);

  console.log('Database seeded successfully');

  await closeConnection();
};

main().catch(async (e) => {
  console.error(e);
  await closeConnection();
});
