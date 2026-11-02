export type DatabaseCommand =
  | { type: "ping" }
  | { type: "list" }
  | { type: "create"; name: unknown }
  | { type: "rename"; bucketId: unknown; name: unknown }
  | { type: "remove"; bucketId: unknown }
  | { type: "close" };

export type DatabaseRequest = {
  id: number;
  command: DatabaseCommand;
};

export type DatabaseResponse =
  | { id: number; ok: true; value: unknown }
  | { id: number; ok: false; message: string };