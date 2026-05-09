import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { UserModel, type User } from './models/User.js';
import { ReviewModel, type Review } from './models/Review.js';
import { CommentModel, type Comment } from './models/Comment.js';
import { checkString } from '../helpers/validation.js';

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
) => {
  const id = checkObjectId(userId);

  if (!firstName || !lastName || !email) {
    throw 'Error: First name, last name, and email are required.';
  }

  const checkedFirstName = checkString(firstName, 2, 50, /[^a-zA-Z ]/);
  const checkedLastName = checkString(lastName, 2, 50, /[^a-zA-Z ]/);
  const checkedEmail = checkString(email, 5, 255, /[^\w@.\-]/i).toLowerCase();

  const existingUser = await UserModel.findOne({
    email: new RegExp(`^${checkedEmail}$`, 'i'),
    _id: { $ne: id },
  });

  if (existingUser) {
    throw 'Error: An account with that email already exists.';
  }

  const updateDoc: Partial<User> = {
    firstName: checkedFirstName,
    lastName: checkedLastName,
    email: checkedEmail,
  } as Partial<User>;

  if (password && password.trim().length > 0) {
    const checkedPassword = checkString(password, 8, undefined, /\s/);

    if (
      !/[A-Z]/.test(checkedPassword) ||
      !/[0-9]/.test(checkedPassword) ||
      !/[^a-zA-Z0-9]/.test(checkedPassword)
    ) {
      throw 'Error: Password must contain at least one uppercase letter, one number, and one special character.';
    }

    updateDoc.hashedPassword = await bcrypt.hash(checkedPassword, 12);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(id, updateDoc, {
    new: true,
  }).exec();

  if (!updatedUser) {
    throw 'Error: Could not update user profile.';
  }

  return updatedUser.toObject() as User;
};
