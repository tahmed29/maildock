const { app } = require("electron");
const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const { DatabaseClient } = require("../dist/main/database/client.js");

app.whenReady().then(async () => {
  const folder = mkdtempSync(join(tmpdir(), "maildock-worker-test-"));
  const clients = [];

  function createClient(filePath, options) {
    const client = new DatabaseClient(filePath, options);
    clients.push(client);
    return client;
  }

  try {
    const file = join(folder, "test.db");
    const client = createClient(file);
    await client.ping();

    const created = await Promise.all(
      Array.from({ length: 12 }, (_, index) =>
        client.createBucket(`Bucket ${index}`)
      ),
    );

    assert.equal((await client.listBuckets()).length, 12);
    assert.equal(new Set(created.map((bucket) => bucket.id)).size, 12);

    const duplicates = await Promise.allSettled([
      client.createBucket("Unique"),
      client.createBucket("UNIQUE"),
    ]);

    assert.equal(
      duplicates.filter((result) => result.status === "fulfilled").length,
      1,
    );

    await client.renameBucket(created[0].id, "Renamed");
    await client.removeBucket(created[1].id);

    const finalWrite = client.createBucket("Before close");
    const closing = client.close();
    await finalWrite;
    await closing;

    await assert.rejects(() => client.listBuckets(), /clos/i);

    const reopened = createClient(file);
    const rows = await reopened.listBuckets();

    assert.ok(rows.some((bucket) => bucket.name === "Before close"));
    assert.ok(rows.some((bucket) => bucket.name === "Renamed"));
    assert.ok(!rows.some((bucket) => bucket.id === created[1].id));
    await reopened.close();

    const invalidPath = createClient(
      join(folder, "missing-parent", "test.db"),
    );
    await assert.rejects(() => invalidPath.ping());

    const crashing = createClient(file, {
      workerPath: join(__dirname, "fixtures", "crash-worker.cjs"),
      timeoutMs: 5000,
    });

    await assert.rejects(() => crashing.ping(), /stopped/);
    await assert.rejects(() => crashing.listBuckets(), /stopped/);

    const silent = createClient(file, {
      workerPath: join(__dirname, "fixtures", "silent-worker.cjs"),
      timeoutMs: 500,
    });

    await assert.rejects(() => silent.ping(), /timed out/);
    await assert.rejects(() => silent.listBuckets(), /timed out/);

    console.log("Worker tests passed.");
  } finally {
    await Promise.allSettled(clients.map((client) => client.close()));
    rmSync(folder, { recursive: true, force: true });
  }
}).then(
  () => app.exit(0),
  (error) => {
    console.error(error);
    app.exit(1);
  },
);