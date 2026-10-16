import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

export type StoredBucket = {
  id: string;
  name: string;
};

export function listBuckets(database: Database.Database): StoredBucket[] {
  const statement = database.prepare<[], StoredBucket>(`
    SELECT id, name
    FROM buckets
    ORDER BY created_at ASC, rowid ASC
  `);

  return statement.all();
}

export function insertBucket(
  database: Database.Database,
  name: unknown,
): StoredBucket {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Enter a bucket name.");
  }

  const trimmedName = name.trim();

if (trimmedName.length > 60) {
    throw new Error("Use 60 characters or fewer.");
}

const bucket: StoredBucket = {
  id: randomUUID(),
  name: trimmedName,
};

const result = database.prepare(`
    INSERT INTO buckets (id, name, name_key)
    VALUES (?, ?, ?)
    ON CONFLICT(name_key) DO NOTHING
`).run(bucket.id, bucket.name, trimmedName.toLowerCase());

if (result.changes === 0) {
    throw new Error("A bucket with that name already exists.");
}

return bucket;
}