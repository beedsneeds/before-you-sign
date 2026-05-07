import mongoose from 'mongoose';

const mongoConfig = {
  serverUrl: 'mongodb://localhost:27017/',
  database: 'beforeYouSignDB',
};

export const connect = async (): Promise<void> => {
  await mongoose.connect(mongoConfig.serverUrl, { dbName: mongoConfig.database });
};

export const disconnect = (): Promise<void> => mongoose.disconnect();
