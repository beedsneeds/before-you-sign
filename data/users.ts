import { UserModel, UserInputSchema } from "./models/User.js";
import bcrypt from "bcrypt";
import { formatZodError } from "../helpers/validation.js";
import { Types } from "mongoose";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findUserByEmail = async (email: string) => {
  const emailPattern = `^${escapeRegExp(email.trim())}$`;
  return UserModel.findOne({ email: { $regex: emailPattern, $options: "i" } }).exec();
};

const getDuplicateEmailError = (error: unknown, email: string) => {
  if (error && typeof error === "object" && "code" in error && (error as any).code === 11000) {
    return `Error: ${email} already exists.`;
  }

  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    (error as any).name === "MongoServerError" &&
    (error as any).message?.includes("E11000")
  ) {
    return `Error: ${email} already exists.`;
  }

  return null;
};

export const KARMA_PER_SIGNIN = 1;
export const KARMA_PER_CONTRIBUTION = 3;

export const addKarma = async (userId: Types.ObjectId, amount: number) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Karma amount must be a positive integer");
  }
  await UserModel.findByIdAndUpdate(userId, { $inc: { activityScore: amount } });
};

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

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) throw "Error: An account with that email already exists.";

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  const newUser = new UserModel({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    hashedPassword,
    isAdmin: false,
    activityScore: 0,
    savedBuildings: [],
    notificationPrefs: ["inApp"],
    reviewIds: [],
    commentIds: [],
  });

  try {
    const savedUser = await newUser.save();

    return {
      _id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      isAdmin: savedUser.isAdmin,
    };
  } catch (error) {
    const duplicateMessage = getDuplicateEmailError(error, parsed.data.email);
    if (duplicateMessage) {
      throw duplicateMessage;
    }

    throw error;
  }
};

export const checkUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw "Error: Both email and password must be provided.";
  }

  const user = await findUserByEmail(email);

  if (!user) throw "Error: Either the email or password is invalid.";

  const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
  if (!passwordMatch) throw "Error: Either the email or password is invalid.";

  await addKarma(user._id, KARMA_PER_SIGNIN);

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isAdmin: user.isAdmin,
  };
};
