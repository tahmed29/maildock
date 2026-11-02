import { Worker } from "node:worker_threads";
import { join } from "node:path";
import type { Bucket } from "../../shared/contracts.js";
import type {
  DatabaseCommand,
  DatabaseRequest,
  DatabaseResponse,
} from "./protocol.js";

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

type ClientOptions = {
  workerPath?: string;
  timeoutMs?: number;
};

export class DatabaseClient {
  private readonly worker: Worker;
  private readonly timeoutMs: number;
  private readonly pending = new Map<number, PendingRequest>();
  private nextId = 1;
  private terminalError: Error | null = null;
  private closing = false;
  private closePromise: Promise<void> | null = null;

  constructor(filePath: string, options: ClientOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? 15000;
    this.worker = new Worker(
      options.workerPath ?? join(__dirname, "worker.js"),
      { workerData: { filePath } },
    );

    this.worker.on("message", (response: DatabaseResponse) => {
      const request = this.pending.get(response.id);
      if (!request) return;

      clearTimeout(request.timer);
      this.pending.delete(response.id);

      if (response.ok) {
        request.resolve(response.value);
      } else {
        request.reject(new Error(response.message));
      }
    });

    this.worker.on("error", (error) => this.fail(error));
    this.worker.on("messageerror", () => {
      this.fail(new Error("Could not read the database worker response."));
    });

    this.worker.on("exit", (code) => {
      if (this.closing && this.pending.size === 0 && code === 0) {
        this.terminalError ??= new Error("Database is closed.");
        return;
      }

      this.fail(new Error(`Database worker stopped with code ${code}.`));
    });
  }

    private fail(error: Error): void {
    if (this.terminalError) return;
    this.terminalError = error;

    for (const request of this.pending.values()) {
      clearTimeout(request.timer);
      request.reject(error);
    }

    this.pending.clear();
    void this.worker.terminate().catch(() => {});
  }

  private request<T>(command: DatabaseCommand): Promise<T> {
    if (this.terminalError) return Promise.reject(this.terminalError);
    if (this.closing) {
      return Promise.reject(new Error("Database is closing."));
    }

    const id = this.nextId++;

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.fail(new Error(
          "Database request timed out. Restart MailDock before retrying.",
        ));
      }, this.timeoutMs);

      this.pending.set(id, {
        resolve: (value) => resolve(value as T),
        reject,
        timer,
      });

      try {
        const request: DatabaseRequest = { id, command };
        this.worker.postMessage(request);
      } catch (error: unknown) {
        clearTimeout(timer);
        this.pending.delete(id);
        reject(error instanceof Error ? error : new Error("Request failed."));
      }
    });
  }

    ping(): Promise<void> {
    return this.request<void>({ type: "ping" });
  }

  listBuckets(): Promise<Bucket[]> {
    return this.request<Bucket[]>({ type: "list" });
  }

  createBucket(name: unknown): Promise<Bucket> {
    return this.request<Bucket>({ type: "create", name });
  }

  renameBucket(bucketId: unknown, name: unknown): Promise<Bucket> {
    return this.request<Bucket>({ type: "rename", bucketId, name });
  }

  removeBucket(bucketId: unknown): Promise<void> {
    return this.request<void>({ type: "remove", bucketId });
  }

  close(): Promise<void> {
    if (this.closePromise) return this.closePromise;

    this.closePromise = this.request<void>({ type: "close" });
    this.closing = true;
    return this.closePromise;
  }
}