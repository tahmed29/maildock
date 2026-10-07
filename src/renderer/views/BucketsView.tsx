import { useState } from "react";
import BucketForm from "../components/BucketForm";
import type { Bucket } from "../types/bucket";

type BucketsViewProps = {
  buckets: Bucket[];
  onCreate: (name: string) => void;
  onRemove: (bucketId: string) => void;
};

export default function BucketsView({ 
    buckets, 
    onCreate,
    onRemove,
}: BucketsViewProps) {

const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);

  return (
    <section aria-labelledby="buckets-heading">
      <h1 id="buckets-heading">Smart Buckets</h1>
      <p>Create custom buckets to organize your mail with routing rules.</p>

    <BucketForm 
        onCreate={onCreate} 
        existingNames={buckets.map((bucket) => bucket.name)} 
    />

      {buckets.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-8">
            <h2 className="text-lg font-semibold text-slate-100">
                No buckets yet
            </h2>
        <p className="mt-2">
            A bucket groups messages that match rules you choose.
        </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {buckets.map((bucket) => (
                <li
                    key={bucket.id}
                    className="rounded-xl border border-slate-700 bg-slate-950 p-5"
                >
                    <h2 className="break-words text-lg font-semibold text-slate-100">
                        {bucket.name}
                    </h2>
                    <p className="mt-2 text-sm">No routing rules configured.</p>

                    {pendingRemovalId === bucket.id ? (
                        <div className="mt-4">
                            <p className="text-sm text-slate-300">Are you sure you want to remove this bucket?</p>
                            <div className="mt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onRemove(bucket.id);
                                        setPendingRemovalId(null);
                                    }}
                                    className="rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-400/10"
                                >
                                    Confirm
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPendingRemovalId(null)}
                                    className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                    
                    <button
                        type="button"
                        onClick={() => setPendingRemovalId(bucket.id)}
                        aria-label={`Remove ${bucket.name} bucket`}
                        className="mt-4 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 focus-visible:outline-2 focus-visible:outline-red-400"
                    >
                        Remove
                    </button>
                )}
                </li>
            ))}
        </ul>
        )}
    </section>
  );
}