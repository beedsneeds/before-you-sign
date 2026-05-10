import { Types } from "mongoose";
import { ViolationModel } from "./models/Violation.js";
import { getBuildingById } from "./buildings.js";

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

// violations assoc with registrationId
export const getBuildingsByRegistrationId = async (registrationId: number) => {
  const violations = await ViolationModel.find({
    registrationId: registrationId,
  });

  // multiple vios possible but just need 1 id
  const unique_bldg = [];
  const seen_bldgs = new Set();

  for (const violation of violations) {
    if (!seen_bldgs.has(violation.bin)) {
      seen_bldgs.add(violation.bin);

      const building = await getBuildingById(String(violation.bin));

      const safetyScore = await calculateRatingByViolations(violation.bin);

      unique_bldg.push({
        address: building.address,
        BIN: building.BIN,
        avgRating: building.avgRating,
        reviewsCount: building.reviewsCount,
        safetyScore: safetyScore.rating,
        violationsCount: safetyScore.totalViolations,
      });
    }
  }

  return unique_bldg;
};
