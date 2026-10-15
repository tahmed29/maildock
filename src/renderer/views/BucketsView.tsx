import { useState } from "react";
import BucketForm from "../components/BucketForm";
import type { Bucket } from "../types/bucket";

type BucketsViewProps = {
  buckets: Bucket[];
  onCreate: (name: string) => void;
  onRemove: (bucketId: string) => void;
  onRename: (bucketId: string, name: string) => string | null;
};

export default function BucketsView({
  buckets,
  onCreate,
  onRemove,
  onRename,
}: BucketsViewProps) {
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [editingBucketId, setEditingBucketId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [renameError, setRenameError] = useState("");

  function startRenaming(bucket: Bucket) {
    setEditingBucketId(bucket.id);
    setDraftName(bucket.name);
    setRenameError("");
    setPendingRemovalId(null);
  }

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
          <h2 className="text-lg font-semibold text-slate-100">No buckets yet</h2>
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
              {editingBucketId === bucket.id ? (
                <div>
                  <label
                    htmlFor={`rename-${bucket.id}`}
                    className="mb-2 block text-sm text-slate-300"
                  >
                    Bucket name
                  </label>

                  <input
                    id={`rename-${bucket.id}`}
                    type="text"
                    value={draftName}
                    maxLength={60}
                    aria-invalid={Boolean(renameError)}
                    aria-describedby={
                      renameError ? `rename-error-${bucket.id}` : undefined
                    }
                    onChange={(event) => {
                      setDraftName(event.target.value);
                      setRenameError("");
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none"
                  />

                  {renameError && (
                    <p
                      id={`rename-error-${bucket.id}`}
                      role="alert"
                      className="mt-2 text-sm text-red-400"
                    >
                      {renameError}
                    </p>
                  )}

                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const error = onRename(bucket.id, draftName);
                        if (error) {
                          setRenameError(error);
                          return;
                        }
                        setEditingBucketId(null);
                        setRenameError("");
                      }}
                      className="rounded-md px-3 py-2 text-sm text-sky-400 hover:bg-sky-400/10"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingBucketId(null);
                        setRenameError("");
                      }}
                      className="rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 break-words text-lg font-semibold text-slate-100">
                    {bucket.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => startRenaming(bucket)}
                    aria-label={`Rename ${bucket.name} bucket`}
                    className="shrink-0 rounded-md px-3 py-2 text-sm text-sky-400 hover:bg-sky-400/10"
                  >
                    Rename
                  </button>
                </div>
              )}

              <p className="mt-2 text-sm">No routing rules configured.</p>

              {pendingRemovalId === bucket.id ? (
                <div className="mt-4">
                  <p className="text-sm text-slate-300">
                    Are you sure you want to remove this bucket?
                  </p>
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
                  onClick={() => {
                    setEditingBucketId(null);
                    setRenameError("");
                    setPendingRemovalId(bucket.id);
                  }}    
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