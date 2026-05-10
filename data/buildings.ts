import * as z from 'zod';
import escapeStringRegexp from 'escape-string-regexp';
import {
  BuildingInputSchema,
  BuildingStoredSchema,
  BuildingModel,
  type Building,
} from './models/Building.js';
import { formatZodError } from '../helpers/validation.js';

const BuildingIdSchema = z.coerce.number().int().positive();

export const createBuilding = async (
  address: string,
  binNumber: string | number,
): Promise<Building> => {
  const parsed = BuildingInputSchema.safeParse({
    address: address,
    BIN: Number(binNumber),
  });

  if (!parsed.success) throw formatZodError(parsed.error);

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
  const parsed = BuildingIdSchema.safeParse(buildingID);
  if (!parsed.success) throw formatZodError(parsed.error);

  const building = await BuildingModel.findOne({ BIN: parsed.data });

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
  const parsedId = BuildingIdSchema.safeParse(buildingID);
  if (!parsedId.success) throw formatZodError(parsedId.error);

  const parsed = BuildingStoredSchema.safeParse({
    address: address,
    BIN: Number(binNumber),
    avgRating: Number(avgRating),
    reviewsCount: Number(reviewsCount),
  });
  if (!parsed.success) throw formatZodError(parsed.error);

  const existingBuilding = await BuildingModel.findOne({
    BIN: Number(binNumber),
  });

  if (existingBuilding && existingBuilding.BIN !== Number(buildingID)) {
    throw 'A building with that BIN already exists';
  }

  const updated = await BuildingModel.findOneAndUpdate(
    { BIN: parsedId.data },
    {
      address: parsed.data.address,
      BIN: parsed.data.BIN,
      avgRating: parsed.data.avgRating,
      reviewsCount: parsed.data.reviewsCount,
    },
    { returnDocument: 'after' },
  );

  if (!updated) {
    throw 'Could not update building';
  }

  return updated.toObject();
};

export const deleteBuildingById = async (buildingID: string | number): Promise<boolean> => {
  const parsed = BuildingIdSchema.safeParse(buildingID);
  if (!parsed.success) throw formatZodError(parsed.error);

  const deleted = await BuildingModel.findOneAndDelete({ BIN: parsed.data });

  if (!deleted) {
    throw 'Unable to delete building';
  }

  return true;
};

export const searchBuildings = async (searchTerm: string): Promise<Building[]> => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    throw 'Search term must be supplied';
  }

  const term = searchTerm.trim();

  if (term.length === 0) {
    throw 'Search term cannot be empty';
  }

  const addressRegex = new RegExp(escapeStringRegexp(term), 'i');

  const query = /^\d+$/.test(term)
    ? {
        $or: [
          { address: addressRegex },
          { $expr: { $regexMatch: { input: { $toString: '$BIN' }, regex: term } } },
        ],
      }
    : { address: addressRegex };

  const results = await BuildingModel.find(query);

  return results.map((building) => building.toObject());
};
