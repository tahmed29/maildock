import { useState } from "react";
import BucketForm from "../components/BucketForm";

type Bucket = {
  id: string;
  name: string;
};

export default function BucketsView() {
    const [buckets, setBuckets] = useState<Bucket[]>([]);

    function createBucket(name: string) {
        setBuckets((current) => [
            ...current, 
            { id: crypto.randomUUID(), name }
        ]);
    }

  return (
    <section aria-labelledby="buckets-heading">
      <h1 id="buckets-heading">Smart Buckets</h1>
      <p>Create custom buckets to organize your mail with routing rules.</p>

      <BucketForm onCreate={createBucket} />

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
                </li>
            ))}
        </ul>
        )}
    </section>
  );
}