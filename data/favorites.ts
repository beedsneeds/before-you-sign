import { Types } from 'mongoose';
import { UserModel } from './models/User.js';

export const addFavBuilding = async (userId: string, buildingId: string) => {
  if (!Types.ObjectId.isValid(userId)) throw 'Invalid user ID';
  if (!Types.ObjectId.isValid(buildingId)) throw 'Invalid building ID';

  const updateUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      $addToSet: {
        savedBuildings: new Types.ObjectId(buildingId),
      },
    },
    { new: true },
  );

  if (!updateUser) throw 'User not found';
  return updateUser.toObject();
};

export const removeFavBuilding = async (userId: string, buildingId: string) => {
  if (!Types.ObjectId.isValid(userId)) throw 'Invalid user ID';
  if (!Types.ObjectId.isValid(buildingId)) throw 'Invalid building ID';

  const updateUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: {
        savedBuildings: new Types.ObjectId(buildingId),
      },
    },
    { new: true },
  );

  if (!updateUser) throw 'User not found';
  return updateUser.toObject();
};

export const getFavBuildings = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) throw 'Invalid user ID';

  const user = await UserModel.findById(userId).populate('savedBuildings');
  if (!user) throw 'User not found';

  return user.savedBuildings;
};
