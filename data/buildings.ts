// mongoose switch import
import { BuildingInputSchema, BuildingModel, type Building } from './models/Building.js';

const checkBuildingID = (buildingID: string | number): number => {
  if (buildingID === undefined || buildingID === null || buildingID === '') {
    throw 'Building ID must be supplied';
  }

  if (typeof buildingID === 'string') {
    buildingID = buildingID.trim();
  }

  const id = Number(buildingID);

  if (isNaN(id)) throw 'Building ID must be a number';
  if (!Number.isInteger(id)) throw 'Building ID must be a whole number';
  if (id <= 0) throw 'Building ID must be positive';

  return id;
};

const checkAddress = (address: unknown): string => {
  if (!address) throw 'Address must be supplied';
  if (typeof address !== 'string') throw 'Address must be a string';

  const trimmed = address.trim();

  if (trimmed.length === 0) throw 'Address cannot be empty';

  return trimmed;
};

const checkBIN = (binNumber: string | number): number => {
  if (binNumber === undefined || binNumber === null || binNumber === '') {
    throw 'BIN number must be supplied';
  }
  if (typeof binNumber === 'string') {
    binNumber = binNumber.trim();
  }

  const bin = Number(binNumber);

  if (isNaN(bin)) throw 'BIN number must be a number';
  if (!Number.isInteger(bin)) throw 'BIN number must be a whole number';
  if (bin <= 0) throw 'BIN number must be positive';

  return bin;
};

const checkRating = (avgRating: string | number): number => {
  if (avgRating === undefined || avgRating === null || avgRating === '') {
    throw 'Average rating must be supplied';
  }

  if (typeof avgRating === 'string') {
    avgRating = avgRating.trim();
  }

  const rating = Number(avgRating);

  if (isNaN(rating)) throw 'Average rating must be a number';
  if (rating < 0 || rating > 5) {
    throw 'Average rating must be between 0 and 5';
  }

  return rating;
};

const checkReviewsCount = (reviewsCount: string | number): number => {
  if (reviewsCount === undefined || reviewsCount === null || reviewsCount === '') {
    throw 'Reviews count must be supplied';
  }

  if (typeof reviewsCount === 'string') {
    reviewsCount = reviewsCount.trim();
  }

  const count = Number(reviewsCount);

  if (isNaN(count)) throw 'Reviews count must be number';
  if (!Number.isInteger(count)) {
    throw 'Reviews count must be whole number';
  }
  if (count < 0) throw 'Reviews count cannot be negative';

  return count;
};

export const createBuilding = async (
  address: string,
  binNumber: string | number,
): Promise<Building> => {
  const parsed = BuildingInputSchema.safeParse({
    address: address,
    BIN: Number(binNumber),
  });

  if (!parsed.success) {
    throw parsed.error.issues.map((issue) => issue.message).join(', ');
  }

  if (parsed.data.address.length === 0) {
    throw 'Address cannot be empty';
  }

  const existingBuilding = await BuildingModel.findOne({
    BIN: parsed.data.BIN,
  });

  if (existingBuilding) {
    throw 'A building with that BIN already exists';
  }

  const newBuilding = await BuildingModel.create({
    address: parsed.data.address,
    BIN: parsed.data.BIN,
    avgRating: 0,
    reviewsCount: 0,
  });

  return newBuilding.toObject();
};

export const getBuildingById = async (buildingID: string | number): Promise<Building> => {
  buildingID = checkBuildingID(buildingID);

  const building = await BuildingModel.findOne({
    BIN: Number(buildingID),
  });
  console.log('SEARCH BIN:', buildingID);
  console.log('FOUND:', building);

  if (!building) throw 'No building found with that Building ID';

  return building.toObject();
};

export const updateBuildingById = async (
  buildingID: string | number,
  address: string,
  binNumber: string | number,
  avgRating: string | number,
  reviewsCount: string | number,
): Promise<Building> => {
  buildingID = checkBuildingID(buildingID);
  address = checkAddress(address);
  binNumber = checkBIN(binNumber);
  avgRating = checkRating(avgRating);
  reviewsCount = checkReviewsCount(reviewsCount);

  const existingBuilding = await BuildingModel.findOne({
    BIN: Number(binNumber),
  });

  if (existingBuilding && existingBuilding.BIN !== Number(buildingID)) {
    throw 'A building with that BIN already exists';
  }

  const updated = await BuildingModel.findOneAndUpdate(
    { BIN: Number(buildingID) },
    {
      address: address,
      BIN: Number(binNumber),
      avgRating: avgRating,
      reviewsCount: reviewsCount,
    },
    { new: true },
  );

  if (!updated) {
    throw 'Could not update building';
  }

  return updated.toObject();
};

export const deleteBuildingById = async (buildingID: string | number): Promise<boolean> => {
  buildingID = checkBuildingID(buildingID);

  const deleted = await BuildingModel.findOneAndDelete({
    BIN: Number(buildingID),
  });

  if (!deleted) {
    throw 'Unable to delete building';
  }

  return true;
};
