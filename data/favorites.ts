import { Types } from 'mongoose';
import { UserModel } from './models/User.js';

export const addFavBuilding = async (userId: string, buildingId: string) => {
  if (!Types.ObjectId.isValid(userId)) throw 'Invalid user ID';
  if (!Types.ObjectId.isValid(buildingId)) throw 'Invalid building ID';

  const user = await UserModel.findById(userId);
  if (!user) throw 'User not found';

  const alreadyFavorited = user.savedBuildings.some((savedId) => savedId.toString() === buildingId);

  if (alreadyFavorited) {
    return {
      alreadyFavorited: true,
    };
  }

  user.savedBuildings.push(new Types.ObjectId(buildingId));
  await user.save();

  return {
    alreadyFavorited: false,
  };
};

export const removeFavBuilding = async (userId: string, buildingId: string) => {
  if (!Types.ObjectId.isValid(userId)) throw 'Invalid user ID';
  if (!Types.ObjectId.isValid(buildingId)) throw 'Invalid building ID';

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      $pull: {
        savedBuildings: new Types.ObjectId(buildingId),
      },
    },
    { new: true },
  );

  if (!updatedUser) throw 'User not found';

  return updatedUser.toObject();
};

export const getFavBuildings = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) throw 'Invalid user ID';

  const user = await UserModel.findById(userId).populate('savedBuildings');

  if (!user) throw 'User not found';

  return user.savedBuildings;
};
