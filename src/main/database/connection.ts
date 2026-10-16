import Database from "better-sqlite3";
import { bucketSchema } from "./schema.js";

export function openDatabase(filePath: string): Database.Database {
  const database = new Database(filePath);

  try {
    database.exec(bucketSchema);
    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}