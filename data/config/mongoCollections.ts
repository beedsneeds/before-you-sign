import { Collection, Document } from "mongodb";
import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection: string) => {
  let _col: Collection<Document> | undefined = undefined;

  return async (): Promise<Collection<Document>> => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const users = getCollectionFn("users");
export const buildings = getCollectionFn("buildings");
export const violations = getCollectionFn("violations");
export const reviews = getCollectionFn("reviews");
export const comments = getCollectionFn("comments");
