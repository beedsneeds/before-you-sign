import mongoose from "mongoose";
import { mongoConfig } from "./settings.js";

export const connect = async (): Promise<void> => {
  await mongoose.connect(mongoConfig.serverUrl, { dbName: mongoConfig.database });
};

export const disconnect = (): Promise<void> => mongoose.disconnect();
