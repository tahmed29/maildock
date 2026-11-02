import { parentPort, workerData } from "node:worker_threads";
import { openDatabase } from "./connection.js";
import {
  deleteBucket,
  insertBucket,
  listBuckets,
  updateBucketName,
} from "./bucketRepository.js";
import type {
  DatabaseCommand,
  DatabaseRequest,
  DatabaseResponse,
} from "./protocol.js";

const port = parentPort;

if (!port || typeof workerData?.filePath !== "string") {
  throw new Error("Database worker requires a file path and message port.");
}

const database = openDatabase(workerData.filePath);

function execute(command: DatabaseCommand): unknown {
  switch (command.type) {
    case "ping":
      return null;
    case "list":
      return listBuckets(database);
    case "create":
      return insertBucket(database, command.name);
    case "rename":
      return updateBucketName(database, command.bucketId, command.name);
    case "remove":
      deleteBucket(database, command.bucketId);
      return null;
    case "close":
      database.close();
      return null;
    default:
      throw new Error("Unknown database operation.");
  }
}

port.on("message", (request: DatabaseRequest) => {
  let response: DatabaseResponse;

  try {
    response = {
      id: request.id,
      ok: true,
      value: execute(request.command),
    };
  } catch (error: unknown) {
    console.error("Database operation failed:", error);
    response = {
      id: request.id,
      ok: false,
      message: error instanceof Error ? error.message : "Database operation failed.",
    };
  }

  port.postMessage(response);

  if (request.command.type === "close") {
    port.close();
  }
});