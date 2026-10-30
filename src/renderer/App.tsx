import type { ViewId } from "./navigation";
import Sidebar from "./components/Sidebar";
import type { Bucket } from "./types/bucket";
import { useEffect, useState } from "react";
import BucketsView from "./views/BucketsView";

export default function App() {
    const [activeView, setActiveView] = useState<ViewId>("inbox");
    const [buckets, setBuckets] = useState<Bucket[]>([]);

    const [bucketLoadError, setBucketLoadError] = useState("");

    const [isLoadingBuckets, setIsLoadingBuckets] = useState(true);
    const [loadAttempt, setLoadAttempt] = useState(0);

    useEffect(() => {
      let active = true;

      setIsLoadingBuckets(true);
      setBucketLoadError("");

      window.maildock.listBuckets()
        .then((savedBuckets) => {
          if (active) {
            setBuckets(savedBuckets);
          }
        })
        .catch((error: unknown) => {
          console.error("Failed to load buckets:", error);

          if (active) {
            setBucketLoadError("Could not load saved buckets.");
          }
        })
        .finally(() => {
          if (active) {
            setIsLoadingBuckets(false);
          }
        });

      return () => {
        active = false;
      };
    }, [loadAttempt]);

    async function createBucket(name: string): Promise<void> {
        const savedBucket = await window.maildock.createBucket(name);

        setBuckets((current) => [...current, savedBucket]);
    }

    async function removeBucket(bucketId: string): Promise<void> {
        await window.maildock.removeBucket(bucketId);

        setBuckets((current) => 
            current.filter((bucket) => bucket.id !== bucketId));
    }

    async function renameBucket(
      bucketId: string,
      name: string,
    ): Promise<string | null> {
      const trimmedName = name.trim();

      if (!trimmedName) return "Bucket name cannot be empty.";
      if (trimmedName.length > 60) return "Use 60 characters or fewer.";

      const duplicate = buckets.some(
        (bucket) =>
          bucket.id !== bucketId &&
          bucket.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (duplicate) return "A bucket with that name already exists.";

      try {
        const savedBucket = await window.maildock.renameBucket(
          bucketId,
          trimmedName,
        );

        setBuckets((current) =>
          current.map((bucket) =>
            bucket.id === bucketId ? savedBucket : bucket
          )
        );

        return null;
      } catch (error: unknown) {
        console.error("Failed to rename bucket:", error);
        return "Could not rename this bucket. Please try again.";
      }
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />

            <main className="min-w-0 flex-1">
                {bucketLoadError && (
                    <div className="mb-4">
                        <p role="alert" className="text-sm text-red-400">
                        {bucketLoadError}
                        </p>
                        <button
                          type="button"
                          onClick={() => setLoadAttempt((current) => current + 1)}
                          className="mt-2 rounded-md px-3 py-2 text-sm text-sky-400 hover:bg-sky-400/10"
                        >
                          Retry loading
                        </button>
                    </div>
                )}

                {activeView === "inbox" ? (
                    <>
                        <h1>Inbox</h1>
                        <p>Your messages will appear here once an account is connected.</p>
                    </>
                ) : isLoadingBuckets ? (
                    <p role="status">Loading saved buckets...</p>
                ) : bucketLoadError ? (
                    <p>Bucket actions are unavailable until loading succeeds.</p>
                ) : (
                    <BucketsView
                        buckets={buckets}
                        onCreate={createBucket}
                        onRemove={removeBucket}
                        onRename={renameBucket}
                    />
                )}
            </main>
        </div>
    );
}