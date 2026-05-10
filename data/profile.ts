import * as z from 'zod';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UserModel, UserInputSchema, NotifyMethod, type User } from './models/User.js';
import { ReviewModel, type Review } from './models/Review.js';
import { CommentModel, type Comment } from './models/Comment.js';
import { formatZodError } from '../helpers/validation.js';

const NotificationPrefsSchema = z.array(NotifyMethod);

const ProfileUpdateSchema = UserInputSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
});

const checkObjectId = (id: string): Types.ObjectId => {
  if (!id || typeof id !== 'string') {
    throw 'Error: User ID must be provided.';
  }

  if (!Types.ObjectId.isValid(id)) {
    throw 'Error: Invalid user ID.';
  }

  return new Types.ObjectId(id);
};

export const getUserProfileById = async (userId: string) => {
  const id = checkObjectId(userId);

  const user = await UserModel.findById(id).populate('savedBuildings').exec();
  if (!user) {
    throw 'Error: User not found.';
  }

  const savedBuildings = Array.isArray(user.savedBuildings)
    ? user.savedBuildings.map((building: any) =>
        typeof building.toObject === 'function' ? building.toObject() : building,
      )
    : [];

  const reviews = await ReviewModel.find({ userId: id })
    .populate('buildingId')
    .sort({ timeCreated: -1 })
    .exec();

  const comments = await CommentModel.find({ userId: id })
    .populate('buildingId')
    .sort({ timeCreated: -1 })
    .exec();

  return {
    user: user.toObject() as User,
    savedBuildings,
    reviews: reviews.map((review) => review.toObject() as Review),
    comments: comments.map((comment) => comment.toObject() as Comment),
  };
};

export const updateUserProfile = async (
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  password?: string,
  notificationPrefs?: unknown,
) => {
  const id = checkObjectId(userId);

  const parsed = ProfileUpdateSchema.safeParse({ firstName, lastName, email });
  if (!parsed.success) throw formatZodError(parsed.error);

  const checkedEmail = parsed.data.email.toLowerCase();

  const existingUser = await UserModel.findOne({
    email: checkedEmail,
    _id: { $ne: id },
  });

  if (existingUser) {
    throw 'An account with that email already exists.';
  }

  const updateDoc: {
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword?: string;
    notificationPrefs?: NotifyMethod[];
  } = {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: checkedEmail,
  };

  if (password && password.trim().length > 0) {
    const parsedPassword = UserInputSchema.shape.password.safeParse(password);
    if (!parsedPassword.success) throw formatZodError(parsedPassword.error);

    updateDoc.hashedPassword = await bcrypt.hash(parsedPassword.data, 12);
  }

  if (notificationPrefs !== undefined) {
    const parsedPrefs = NotificationPrefsSchema.safeParse(notificationPrefs);
    if (!parsedPrefs.success) throw formatZodError(parsedPrefs.error);
    updateDoc.notificationPrefs = parsedPrefs.data;
  }

  const updatedUser = await UserModel.findByIdAndUpdate(id, updateDoc, {
    returnDocument: 'after',
  }).exec();

  if (!updatedUser) {
    throw 'Error: Could not update user profile.';
  }

  return updatedUser.toObject() as User & { _id: Types.ObjectId };
};
