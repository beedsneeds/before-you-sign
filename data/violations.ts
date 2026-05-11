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

//updating the calculation to make it time weighted
//decayingfactor = e^(-violationage(years)/halfLife(years))
//I'll use 1 as the halflife so that after every 1 year, the violation loses half of its impact

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

  let severityScore = 0;

  const now = new Date();
  const halfLife = 1;
  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365;

  for (const violation of violations) {
    let classImpact = 0;

    if (violation.class === "A") {
      classImpact = 1;
      classACount++;
    } else if (violation.class === "B") {
      classImpact = 2;
      classBCount++;
    } else if (violation.class === "C") {
      classImpact = 4;
      classCCount++;
    } else if (violation.class === "I") {
      classImpact = 0.5;
      classICount++;
    }

    let rentImpairingImpact = 0;

    if (violation.rentImpairing === true) {
      rentImpairingImpact = 1.5;
      rentImpairingCount++;
    }

    //I'm not sure if all the violations have dates so this is kinda just a safeguard just in case no date
    if (!violation.novIssuedDate) continue;

    const violationDate = violation.novIssuedDate;

    const ageInYears = Math.max(
      0,
      (now.getTime() - new Date(violationDate).getTime()) / millisecondsInYear,
    );

    const decayFactor = Math.pow(0.5, ageInYears / halfLife);

    severityScore += (classImpact + rentImpairingImpact) * decayFactor;
  }

  // const severityScore =
  //   classACount * 1 +
  //   classBCount * 2 +
  //   classCCount * 4 +
  //   classICount * 0.5 +
  //   rentImpairingCount * 2;

  const rating = Number((5 / (1 + severityScore / 100)).toFixed(2));

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
  if (!Number.isInteger(regID) || regID < 0) return [];

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
