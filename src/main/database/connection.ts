import Database from "better-sqlite3";
import { migrateDatabase } from "./migrations.js";

export function openDatabase(filePath: string): Database.Database {
  const database = new Database(filePath, { timeout: 5000 });

  try {
    database.pragma("foreign_keys = ON");
    migrateDatabase(database);
    return database;
  } catch (error: unknown) {
    database.close();
    throw error;
  }
}