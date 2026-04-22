import { MongoClient, Db } from "mongodb";
import { mongoConfig } from "./settings.ts";

let _connection: MongoClient | undefined = undefined;
let _db: Db | undefined = undefined;

const dbConnection = async (): Promise<Db> => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }

  return _db as Db;
};

const closeConnection = async (): Promise<void> => {
  if (_connection) {
    await _connection.close();
    _connection = undefined;
    _db = undefined;
  }
};

export { dbConnection, closeConnection };
