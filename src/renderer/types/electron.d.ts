import type { Bucket } from "./bucket";

declare global {
  interface Window {
    maildock: {
      getAppVersion: () => Promise<string>;
      listBuckets: () => Promise<Bucket[]>;
      createBucket: (name: string) => Promise<Bucket>;
    };
  }
}