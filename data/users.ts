import { users } from './config/mongoCollections.js';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { checkString } from '../helpers/validation.js';

interface User {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  isAdmin: boolean;
  activityScore: number;
  savedBuildings: [];
  reviewIds: [];
  commentIds: [];
}

export const createUser = async ({
  firstName,
  lastName,
  email,
  password,
  isAdmin = false,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}) => {
  if (!firstName || !lastName || !email || !password) {
    throw 'Error: All fields must be provided.';
  }

  const checkedFirstName = checkString(firstName, 2, 50, /[^a-zA-Z]/);
  const checkedLastName = checkString(lastName, 2, 50, /[^a-zA-Z]/);
  const checkedEmail = checkString(email, 5, 255, /^[^\s@]+@[^\s@]+\.[^\s@]+$/).toLowerCase();
  const checkedPassword = checkString(password, 8, undefined, /\s/);

  if (
    !/[A-Z]/.test(checkedPassword) ||
    !/[0-9]/.test(checkedPassword) ||
    !/[^a-zA-Z0-9]/.test(checkedPassword)
  ) {
    throw 'Error: Password must contain at least one uppercase letter, one number, and one special character.';
  }

  const userCollection = await users();

  const existing = await userCollection.findOne({
    email: { $regex: `^${checkedEmail}$`, $options: 'i' },
  });

  if (existing) throw 'Error: An account with that email already exists.';

  const hashedPassword = await bcrypt.hash(checkedPassword, 12);

  const newUser: User = {
    _id: new ObjectId(),
    firstName: checkedFirstName,
    lastName: checkedLastName,
    email: checkedEmail,
    hashedPassword,
    isAdmin: false,
    activityScore: 0,
    savedBuildings: [],
    reviewIds: [],
    commentIds: [],
  };

  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw 'Error: Could not create user.';
  }

  return {
    _id: insertInfo.insertedId,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email,
    isAdmin: newUser.isAdmin,
  };
};

export const checkUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw 'Error: Both email and password must be provided.';
  }

  const checkedEmail = checkString(email, 5, 255, /^[^\s@]+@[^\s@]+\.[^\s@]+$/).toLowerCase();
  const checkedPassword = checkString(password, 8, undefined, /\s/);

  const userCollection = await users();

  const user = await userCollection.findOne({
    email: { $regex: `^${checkedEmail}$`, $options: 'i' },
  });

  if (!user) throw 'Error: Either the email or password is invalid.';

  const passwordMatch = await bcrypt.compare(checkedPassword, user['hashedPassword']);
  if (!passwordMatch) throw 'Error: Either the email or password is invalid.';

  await userCollection.updateOne(
    { _id: user._id },
    {
      $inc: { activityScore: 1 },
    },
  );

  return {
    _id: user._id,
    firstName: user['firstName'],
    lastName: user['lastName'],
    email: user['email'],
    isAdmin: user['isAdmin'],
  };
};
