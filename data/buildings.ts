// mongoose switch import
import { BuildingModel } from './models/Building.js';

const checkBuildingID = (buildingID: any) => {
  if (!buildingID) throw 'Building ID must be supplied';

  if (typeof buildingID === 'string') {
    buildingID = buildingID.trim();
  }

  buildingID = Number(buildingID);

  if (isNaN(buildingID)) throw 'Building ID must be a number';
  if (!Number.isInteger(buildingID)) throw 'Building ID must be a whole number';
  if (buildingID <= 0) throw 'Building ID must be positive';

  return buildingID;
};

const checkAddress = (address: any) => {
  if (!address) throw 'Address must be supplied';
  if (typeof address !== 'string') throw 'Address must be a string';

  address = address.trim();

  if (address.length === 0) throw 'Address cannot be empty';

  return address;
};

const checkBIN = (binNumber: any) => {
  if (!binNumber) throw 'BIN number must be supplied';

  if (typeof binNumber === 'string') {
    binNumber = binNumber.trim();
  }

  binNumber = Number(binNumber);

  if (isNaN(binNumber)) throw 'BIN number must be a number';
  if (!Number.isInteger(binNumber)) throw 'BIN number must be a whole number';
  if (binNumber <= 0) throw 'BIN number must be positive';

  return binNumber;
};

const checkRating = (avgRating: any) => {
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

const checkReviewsCount = (reviewsCount: any) => {
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

export const getBuildingById = async (buildingID: any) => {
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
  buildingID: any,
  address: any,
  binNumber: any,
  avgRating: any,
  reviewsCount: any,
) => {
  buildingID = checkBuildingID(buildingID);
  address = checkAddress(address);
  binNumber = checkBIN(binNumber);
  avgRating = checkRating(avgRating);
  reviewsCount = checkReviewsCount(reviewsCount);

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

  console.log('updated:', updated);

  if (!updated) {
    throw 'Could not update building';
  }

  return updated.toObject();
};

export const deleteBuildingById = async (buildingID: any) => {
  buildingID = checkBuildingID(buildingID);

  const deleted = await BuildingModel.findOneAndDelete({
    BIN: Number(buildingID),
  });

  if (!deleted) {
    throw 'Unable to delete building';
  }

  return true;
};
