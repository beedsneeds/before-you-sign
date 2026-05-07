import { Types } from 'mongoose';
import { ViolationModel } from './models/Violation.js';

//get violations for 1 building
export const getViolationsByBuildingId = async (buildingId: Types.ObjectId) => {
  const violations = await ViolationModel.find({
    buildingId: buildingId,
  }).lean();

  return violations;
};
