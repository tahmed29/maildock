const { app } = require("electron");
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const Database = require("better-sqlite3");

const { openDatabase } = require("../dist/main/database/connection.js");
const { bucketSchema } = require("../dist/main/database/schema.js");
const {
  listBuckets,
  insertBucket,
  deleteBucket,
  updateBucketName,
} = require("../dist/main/database/bucketRepository.js");

app.whenReady().then(() => {
  const folder = mkdtempSync(join(tmpdir(), "maildock-storage-test-"));
  const file = join(folder, "test.db");
  let database;

  try {
    // Simulate a database created before migrations were added.
    database = new Database(file);
    database.exec(bucketSchema);
    database.prepare(`
      INSERT INTO buckets (id, name, name_key)
      VALUES (?, ?, ?)
    `).run("legacy-id", "Legacy", "legacy");
    database.close();

    database = openDatabase(file);
    assert.equal(database.pragma("user_version", { simple: true }), 1);
    assert.equal(listBuckets(database)[0].name, "Legacy");
    assert.equal(database.pragma("foreign_keys", { simple: true }), 1);

    const work = insertBucket(database, "  Work  ");
    assert.equal(work.name, "Work");
    assert.throws(() => insertBucket(database, "WORK"), /already exists/);
    assert.throws(() => insertBucket(database, "   "), /name/i);
    assert.throws(() => insertBucket(database, 42), /name/i);
    assert.throws(() => insertBucket(database, "x".repeat(61)), /60/);

    const personal = insertBucket(database, "Personal");
    assert.throws(
      () => updateBucketName(database, personal.id, "work"),
      /already exists/,
    );
    assert.equal(
      listBuckets(database).find((bucket) => bucket.id === personal.id).name,
      "Personal",
    );

    updateBucketName(database, work.id, "WORK");
    updateBucketName(database, work.id, "Career");
    assert.throws(
      () => updateBucketName(database, "missing-id", "Missing"),
      /no longer exists/,
    );

    deleteBucket(database, personal.id);
    deleteBucket(database, personal.id);
    assert.throws(() => deleteBucket(database, null), /Invalid/);

    const quoted = insertBucket(database, "O'Reilly");
    assert.ok(listBuckets(database).some((bucket) => bucket.id === quoted.id));

    database.close();
    database = openDatabase(file);

    assert.equal(
      listBuckets(database).find((bucket) => bucket.id === work.id).name,
      "Career",
    );
    assert.ok(!listBuckets(database).some((bucket) => bucket.id === personal.id));

    database.pragma("user_version = 999");
    database.close();
    database = undefined;

    assert.throws(() => openDatabase(file), /newer version/);
    console.log("Storage tests passed.");
  } finally {
    if (database?.open) database.close();
    rmSync(folder, { recursive: true, force: true });
  }
}).then(
  () => app.exit(0),
  (error) => {
    console.error(error);
    app.exit(1);
  },
);