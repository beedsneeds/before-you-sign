import { UserModel, UserInputSchema } from './models/User.js';
import bcrypt from 'bcrypt';
import { formatZodError } from '../helpers/validation.js';

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
  const parsed = UserInputSchema.safeParse({ firstName, lastName, email, password });
  if (!parsed.success) throw formatZodError(parsed.error);

  const checkedEmail = parsed.data.email.toLowerCase();

  const existing = await UserModel.findOne({ email: checkedEmail });

  if (existing) throw 'Error: An account with that email already exists.';

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  const newUser = new UserModel({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: checkedEmail,
    hashedPassword,
    isAdmin: false,
    activityScore: 0,
    savedBuildings: [],
    notificationPrefs: ['inApp'],
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

  const checkedEmail = email.trim().toLowerCase();

  const user = await UserModel.findOne({ email: checkedEmail });

  if (!user) throw 'Error: Either the email or password is invalid.';

  const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
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
