import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

import type { Bucket as StoredBucket } from "../../shared/contracts.js";
export type { Bucket as StoredBucket } from "../../shared/contracts.js";

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

export function deleteBucket(
  database: Database.Database,
  bucketId: unknown,
): void {
  if (typeof bucketId !== "string" || !bucketId.trim()) {
    throw new Error("Invalid bucket ID.");
  }

  database.prepare(`
    DELETE FROM buckets WHERE id = ?
  `).run(bucketId);
}

export function updateBucketName(
  database: Database.Database,
  bucketId: unknown,
  name: unknown,
): StoredBucket {
  if (typeof bucketId !== "string" || !bucketId.trim()) {
    throw new Error("Invalid bucket ID.");
  }

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Enter a bucket name.");
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 60) {
    throw new Error("Use 60 characters or fewer.");
  }

  try {
    const result = database.prepare(`
      UPDATE buckets
      SET name = ?, name_key = ?
      WHERE id = ?
    `).run(trimmedName, trimmedName.toLowerCase(), bucketId);

    if (result.changes === 0) {
      throw new Error("Bucket no longer exists.");
    }
  } catch (error: unknown) {
    if (
      error instanceof Database.SqliteError &&
      error.code === "SQLITE_CONSTRAINT_UNIQUE"
    ) {
      throw new Error("A bucket with that name already exists.");
    }

    throw error;
  }

  return { id: bucketId, name: trimmedName };
}