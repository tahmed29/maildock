export type Bucket = {
  id: string;
  name: string;
};

export interface MaildockApi {
  getAppVersion(): Promise<string>;
  listBuckets(): Promise<Bucket[]>;
  createBucket(name: string): Promise<Bucket>;
  removeBucket(bucketId: string): Promise<void>;
  renameBucket(bucketId: string, name: string): Promise<Bucket>;
}