import * as z from 'zod';
import { Types } from 'mongoose';
import { UserModel } from './models/User.js';
import { BuildingModel } from './models/Building.js';
import { formatZodError } from '../helpers/validation.js';

const UserIdSchema = z
  .string()
  .refine((s) => Types.ObjectId.isValid(s), { message: 'Invalid user ID' })
  .transform((s) => new Types.ObjectId(s));

const BinSchema = z.coerce.number().int().positive();

export const addFavBuilding = async (userId: string, buildingBIN: string | number) => {
  const parsedUid = UserIdSchema.safeParse(userId);
  if (!parsedUid.success) throw formatZodError(parsedUid.error);

  const parsedBin = BinSchema.safeParse(buildingBIN);
  if (!parsedBin.success) throw formatZodError(parsedBin.error);

  const building = await BuildingModel.findOne({ BIN: parsedBin.data }, { _id: 1 });
  if (!building) throw 'Error: Building not found.';

  const user = await UserModel.findById(parsedUid.data);
  if (!user) throw 'Error: User not found.';

  const alreadyFavorited = user.savedBuildings.some((id) => id.equals(building._id));
  if (alreadyFavorited) return { alreadyFavorited: true };

  user.savedBuildings.push(building._id);
  await user.save();
  return { alreadyFavorited: false };
};

export const removeFavBuilding = async (userId: string, buildingBIN: string | number) => {
  const parsedUid = UserIdSchema.safeParse(userId);
  if (!parsedUid.success) throw formatZodError(parsedUid.error);

  const parsedBin = BinSchema.safeParse(buildingBIN);
  if (!parsedBin.success) throw formatZodError(parsedBin.error);

  const building = await BuildingModel.findOne({ BIN: parsedBin.data }, { _id: 1 });
  if (!building) throw 'Error: Building not found.';

  const updatedUser = await UserModel.findByIdAndUpdate(
    parsedUid.data,
    { $pull: { savedBuildings: building._id } },
    { returnDocument: 'after' },
  );
  if (!updatedUser) throw 'Error: User not found.';

  return updatedUser.toObject();
};

export const getFavBuildings = async (userId: string) => {
  const parsedUid = UserIdSchema.safeParse(userId);
  if (!parsedUid.success) throw formatZodError(parsedUid.error);

  const user = await UserModel.findById(parsedUid.data).populate('savedBuildings').lean();
  if (!user) throw 'Error: User not found.';

  return user.savedBuildings;
};
