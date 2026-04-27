import { buildings } from '../data/config/mongoCollections.js';

export const getAllBuildings = async () => {
  const buildingCollection = await buildings();
  const allBuildings = await buildingCollection.find({}).toArray();
  return allBuildings;
};
