import { Types } from "mongoose";
import { ViolationModel } from "./models/Violation.js";
import { BuildingModel } from "./models/Building.js";

//get violations for 1 building
export const getViolationsByBuildingId = async (buildingId: Types.ObjectId) => {
  const violations = await ViolationModel.find({
    buildingId: buildingId,
  }).lean();

  return violations;
};

//fucntion to calcluate the rating based on violations
export const calculateRatingByViolations = async (
  bin: number,
): Promise<{
  rating: number;
  totalViolations: number;
  classACount: number;
  classBCount: number;
  classCCount: number;
  classICount: number;
  rentImpairingCount: number;
}> => {
  const violations = await ViolationModel.find({ bin }).lean();

  let classACount = 0;
  let classBCount = 0;
  let classCCount = 0;
  let classICount = 0;
  let rentImpairingCount = 0;

  for (const violation of violations) {
    if (violation.class === "A") {
      classACount++;
    } else if (violation.class === "B") {
      classBCount++;
    } else if (violation.class === "C") {
      classCCount++;
    } else if (violation.class === "I") {
      classICount++;
    }

    if (violation.rentImpairing === true) {
      rentImpairingCount++;
    }
  }

  const severityScore =
    classACount * 1 +
    classBCount * 2 +
    classCCount * 4 +
    classICount * 0.5 +
    rentImpairingCount * 2;

  const rating = Number((5 / (1 + severityScore / 25)).toFixed(2));

  return {
    rating,
    totalViolations: violations.length,
    classACount,
    classBCount,
    classCCount,
    classICount,
    rentImpairingCount,
  };
};

// Buildings sharing an HPD owner registration ID
export const getBuildingsByRegID = async (regID: number) => {
  if (!Number.isInteger(regID) || regID <= 0) return [];

  const buildings = await BuildingModel.find({ regID }).lean();

  return Promise.all(
    buildings.map(async (building) => {
      const safetyScore = await calculateRatingByViolations(building.BIN);
      return {
        address: building.address,
        BIN: building.BIN,
        avgRating: building.avgRating,
        reviewsCount: building.reviewsCount,
        safetyScore: safetyScore.rating,
        violationsCount: safetyScore.totalViolations,
      };
    }),
  );
};
