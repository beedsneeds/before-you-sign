import { buildings } from "./config/mongoCollections.js";

const checkBuildingID = (buildingID) => {
  if (!buildingID) throw "Building ID must be supplied";

  if (typeof buildingID === "string") {
    buildingID = buildingID.trim();
  }

  buildingID = Number(buildingID);

  if (isNaN(buildingID)) throw "Building ID must be a number";
  if (!Number.isInteger(buildingID)) throw "Building ID must be a whole number";
  if (buildingID <= 0) throw "Building ID must be positive";

  return buildingID;
};

const checkAddress = (address) => {
  if (!address) throw "Address must be supplied";
  if (typeof address !== "string") throw "Address must be a string";

  address = address.trim();

  if (address.length === 0) throw "Address cannot be empty";

  return address;
};

const checkBIN = (binNumber) => {
  if (!binNumber) throw "BIN number must be supplied";

  if (typeof binNumber === "string") {
    binNumber = binNumber.trim();
  }

  binNumber = Number(binNumber);

  if (isNaN(binNumber)) throw "BIN number must be a number";
  if (!Number.isInteger(binNumber)) throw "BIN number must be a whole number";
  if (binNumber <= 0) throw "BIN number must be positive";

  return binNumber;
};

const checkRating = (avgRating) => {
  if (avgRating === undefined || avgRating === null || avgRating === "") {
    throw "Average rating must be supplied";
  }

  if (typeof avgRating === "string") {
    avgRating = avgRating.trim();
  }

  avgRating = Number(avgRating);

  if (isNaN(avgRating)) throw "Average rating must be a number";
  if (avgRating < 0 || avgRating > 5) {
    throw "Average rating must be between 0 and 5";
  }

  return avgRating;
};

const checkReviewsCount = (reviewsCount) => {
  if (
    reviewsCount === undefined ||
    reviewsCount === null ||
    reviewsCount === ""
  ) {
    throw "Reviews count must be supplied";
  }

  if (typeof reviewsCount === "string") {
    reviewsCount = reviewsCount.trim();
  }

  reviewsCount = Number(reviewsCount);

  if (isNaN(reviewsCount)) throw "Reviews count must be a number";
  if (!Number.isInteger(reviewsCount)) {
    throw "Reviews count must be a whole number";
  }
  if (reviewsCount < 0) throw "Reviews count cannot be negative";

  return reviewsCount;
};

export const getBuildingById = async (buildingID) => {
  buildingID = checkBuildingID(buildingID);

  const buildingCollection = await buildings();

  const building = await buildingCollection.findOne({
    BuildingID: buildingID,
  });

  if (!building) throw "No building found with that Building ID";

  return building;
};

export const updateBuildingById = async (
  buildingID,
  address,
  binNumber,
  avgRating,
  reviewsCount
) => {
  buildingID = checkBuildingID(buildingID);
  address = checkAddress(address);
  binNumber = checkBIN(binNumber);
  avgRating = checkRating(avgRating);
  reviewsCount = checkReviewsCount(reviewsCount);

  const buildingCollection = await buildings();

  const updateInfo = await buildingCollection.updateOne(
    { BuildingID: buildingID },
    {
      $set: {
        Address: address,
        binNumber: binNumber,
        AvgRating: avgRating,
        ReviewsCount: reviewsCount,
      },
    }
  );

  if (!updateInfo.acknowledged) {
    throw "Could not update building";
  }

  return await getBuildingById(buildingID);
};

export const deleteBuildingById = async (buildingID) => {
  buildingID = checkBuildingID(buildingID);

  const buildingCollection = await buildings();

  const deleteInfo = await buildingCollection.deleteOne({
    BuildingID: buildingID,
  });

  if (deleteInfo.deletedCount === 0) {
    throw "Could not delete building";
  }

  return true;
};

