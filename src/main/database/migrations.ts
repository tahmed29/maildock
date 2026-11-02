import type Database from "better-sqlite3";
import { bucketSchema } from "./schema.js";

const migrations = [bucketSchema];

export function migrateDatabase(database: Database.Database): void {
  const version = database.pragma("user_version", { simple: true });

  if (
    typeof version !== "number" ||
    !Number.isInteger(version) ||
    version < 0
  ) {
    throw new Error("Invalid database version.");
  }

  if (version > migrations.length) {
    throw new Error("This database requires a newer version of MailDock.");
  }

  database.transaction(() => {
    for (let index = version; index < migrations.length; index += 1) {
      database.exec(migrations[index]);
      database.pragma(`user_version = ${index + 1}`);
    }
  })();
}