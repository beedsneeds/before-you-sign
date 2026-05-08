import { Types } from 'mongoose';
import { ViolationModel } from './models/Violation.js';

//get violations for 1 building
export const getViolationsByBuildingId = async (buildingId: Types.ObjectId) => {
  const violations = await ViolationModel.find({
    buildingId: buildingId,
  }).lean();

  return violations;
};

//fucntion to calcluate the rating based on violations
export const calculateRatingByViolations = async (bin: number): Promise<{ rating: number; totalViolations: number; classACount: number; classBCount: number; classCCount: number; classICount: number; rentImpairingCount: number; }> => {
  const violations = await ViolationModel.find({ bin: bin }).lean();

  let totalPenalty = 0;
  let classACount = 0;
  let classBCount = 0;
  let classCCount = 0;
  let classICount = 0;
  let rentImpairingCount = 0;

  for (const violation of violations) {
    if (violation.class === 'A') {
      totalPenalty += 0.5;
      classACount++;
    } else if (violation.class === 'B') {
      totalPenalty += 0.25;
      classBCount++;
    } else if (violation.class === 'C') {
      totalPenalty += 1;
      classCCount++;
    } else if (violation.class === 'I') {
      totalPenalty += 0.1;
      classICount++;
    }

    if (violation.rentImpairing === true) {
      totalPenalty += 0.5;
      rentImpairingCount++;
    }
  }

  const rating = Math.max(0, Number((5 - totalPenalty).toFixed(2)));

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
