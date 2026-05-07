import { UserModel, type User } from './models/User.js';
import bcrypt from 'bcrypt';
import { checkString } from '../helpers/validation.js';

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

  const checkedFirstName = checkString(firstName, 2, 50, /[^a-zA-Z ]/);
  const checkedLastName = checkString(lastName, 2, 50, /[^a-zA-Z ]/);
  const checkedEmail = checkString(email, 5, 255, /[^\w@.\-]/i).toLowerCase();
  const checkedPassword = checkString(password, 8, undefined, /\s/);

  if (
    !/[A-Z]/.test(checkedPassword) ||
    !/[0-9]/.test(checkedPassword) ||
    !/[^a-zA-Z0-9]/.test(checkedPassword)
  ) {
    throw 'Error: Password must contain at least one uppercase letter, one number, and one special character.';
  }

  const existing = await UserModel.findOne({
    email: new RegExp(`^${checkedEmail}$`, 'i'),
  });

  if (existing) throw 'Error: An account with that email already exists.';

  const hashedPassword = await bcrypt.hash(checkedPassword, 12);

  const newUser = new UserModel({
    firstName: checkedFirstName,
    lastName: checkedLastName,
    email: checkedEmail,
    hashedPassword,
    isAdmin: false,
    activityScore: 0,
    savedBuildings: [],
    reviewIds: [],
    commentIds: [],
  });

  const savedUser = await newUser.save();

  return {
    _id: savedUser._id,
    firstName: savedUser.firstName,
    lastName: savedUser.lastName,
    email: savedUser.email,
    isAdmin: savedUser.isAdmin,
  };
};

export const checkUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw 'Error: Both email and password must be provided.';
  }

  const checkedEmail = checkString(email, 5, 255, /[^\w@.\-]/i).toLowerCase();
  const checkedPassword = checkString(password, 8, undefined, /\s/);

  const user = await UserModel.findOne({
    email: new RegExp(`^${checkedEmail}$`, 'i'),
  });

  if (!user) throw 'Error: Either the email or password is invalid.';

  const passwordMatch = await bcrypt.compare(checkedPassword, user.hashedPassword);
  if (!passwordMatch) throw 'Error: Either the email or password is invalid.';

  await UserModel.findByIdAndUpdate(user._id, {
    $inc: { activityScore: 1 },
  });

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isAdmin: user.isAdmin,
  };
};
