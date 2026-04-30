import { Collection, Document } from 'mongodb';
import { buildings } from './config/mongoCollections.js';

interface Building extends Document {
  BuildingID: number;
  Address: string;
  binNumber: number;
  AvgRating: number;
  ReviewsCount: number;
}

const checkBuildingID = (buildingID: string | number): number => {
  if (buildingID === undefined || buildingID === null || buildingID === '') {
    throw 'Building ID must be supplied';
  }

  if (typeof buildingID === 'string') {
    buildingID = buildingID.trim();
  }

  buildingID = Number(buildingID);

  if (isNaN(buildingID)) throw 'Building ID must be a number';
  if (!Number.isInteger(buildingID)) throw 'Building ID must be a whole number';
  if (buildingID <= 0) throw 'Building ID must be positive';

  return buildingID;
};

const checkAddress = (address: unknown): string => {
  if (!address) throw 'Address must be supplied';
  if (typeof address !== 'string') throw 'Address must be a string';

  const trimmedAddress = address.trim();

  if (trimmedAddress.length === 0) throw 'Address cannot be empty';

  return trimmedAddress;
};

const checkBIN = (binNumber: string | number): number => {
  if (binNumber === undefined || binNumber === null || binNumber === '') {
    throw 'BIN number must be supplied';
  }

  if (typeof binNumber === 'string') {
    binNumber = binNumber.trim();
  }

  binNumber = Number(binNumber);

  if (isNaN(binNumber)) throw 'BIN number must be a number';
  if (!Number.isInteger(binNumber)) throw 'BIN number must be a whole number';
  if (binNumber <= 0) throw 'BIN number must be positive';

  return binNumber;
};

const checkRating = (avgRating: string | number): number => {
  if (avgRating === undefined || avgRating === null || avgRating === '') {
    throw 'Average rating must be supplied';
  }

  if (typeof avgRating === 'string') {
    avgRating = avgRating.trim();
  }

  avgRating = Number(avgRating);

  if (isNaN(avgRating)) throw 'Average rating must be a number';
  if (avgRating < 0 || avgRating > 5) {
    throw 'Average rating must be between 0 and 5';
  }

  return avgRating;
};

const checkReviewsCount = (reviewsCount: string | number): number => {
  if (reviewsCount === undefined || reviewsCount === null || reviewsCount === '') {
    throw 'Reviews count must be supplied';
  }

  if (typeof reviewsCount === 'string') {
    reviewsCount = reviewsCount.trim();
  }

  reviewsCount = Number(reviewsCount);

  if (isNaN(reviewsCount)) throw 'Reviews count must be a number';
  if (!Number.isInteger(reviewsCount)) {
    throw 'Reviews count must be a whole number';
  }
  if (reviewsCount < 0) throw 'Reviews count cannot be negative';

  return reviewsCount;
};

export const getBuildingById = async (buildingID: string | number): Promise<Building> => {
  buildingID = checkBuildingID(buildingID);

  const buildingCollection = (await buildings()) as unknown as Collection<Building>;

  const building = await buildingCollection.findOne({
    BuildingID: buildingID,
  });

  if (!building) throw 'No building found with that Building ID';

  return building;
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

  const buildingCollection = (await buildings()) as unknown as Collection<Building>;

  const updateInfo = await buildingCollection.updateOne(
    { BuildingID: buildingID },
    {
      $set: {
        Address: address,
        binNumber: binNumber,
        AvgRating: avgRating,
        ReviewsCount: reviewsCount,
      },
    },
  );

  if (!updateInfo.acknowledged) {
    throw 'Could not update building';
  }

  return await getBuildingById(buildingID);
};

export const deleteBuildingById = async (buildingID: string | number): Promise<boolean> => {
  buildingID = checkBuildingID(buildingID);

  const buildingCollection = (await buildings()) as unknown as Collection<Building>;

  const deleteInfo = await buildingCollection.deleteOne({
    BuildingID: buildingID,
  });

  if (deleteInfo.deletedCount === 0) {
    throw 'Could not delete building';
  }

  return true;
};
