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
  role: 'admin' | 'user';
}

export const createuser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: string,
) => {
  if (!firstName || !lastName || !password || !email || !role) {
    throw 'Error: All fields not provided.';
  }
  const checkedFirstName = checkString(firstName, 2, 50, /[^a-zA-Z]/);
  const checkedLastName = checkString(lastName, 2, 50, /[^a-zA-Z]/);
  const checkedPassword = checkString(password, 8, undefined, /[^\s]/);
  const checkedEmail = checkString(email, 5, 255, /[^\s@]+@[^\s@]+\.[^\s@]+/);
  const checkedRole = checkString(role, 4, 5, /[^a-zA-Z]/);
  const validRoles = ['user', 'admin']; // Roles will be a dropdown menu

  if (
    !/[A-Z]/.test(checkedPassword) ||
    !/[0-9]/.test(checkedPassword) ||
    !/[^a-zA-Z0-9]/.test(checkedPassword)
  ) {
    throw 'Error: Password must contain at least one upper case letter, one number & one special character.';
  }

  const hashedPassword = await bcrypt.hash(checkedPassword, 12);
  console.log('Hashed password:', hashedPassword);

  if (!validRoles.includes(checkedRole)) {
    throw 'Error: Role must be either user or admin.';
  }

  const userCollection = await users();
  const existing = await userCollection.findOne({
    handle: { $regex: `^${checkedEmail}$`, $options: 'i' },
  });
  if (existing) throw 'Error: account already exists';

  let newUser: User = {
    _id: new ObjectId(),
    firstName: checkedFirstName,
    lastName: checkedLastName,
    hashedPassword: hashedPassword,
    email: checkedEmail,
    role: checkedRole as 'admin' | 'user',
  };

  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Error: Could not add user';

  return { userCreated: true };
};

export const authenticateuser = async (email: string, password: string) => {
  if (!email || !password) {
    throw 'Error: Both email and password must be provided.';
  }
  const checkedEmail = checkString(email, 5, 12, /[^a-zA-Z0-9]/);
  const checkedPassword = checkString(password, 8, undefined, /[^\s]/);

  const userCollection = await users();
  const user = await userCollection.findOne({
    handle: { $regex: `^${checkedEmail}$`, $options: 'i' },
  });
  if (!user) throw 'Error: Either the handle or password is invalid';

  const passwordMatch = await bcrypt.compare(checkedPassword, user['hashedPassword']);
  if (!passwordMatch) throw 'Error: Either the email or password is invalid';

  await userCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        activityScore: (user['activityScore'] || 0) + 1, // Increment activity score on successful login
      },
    },
  );
};
