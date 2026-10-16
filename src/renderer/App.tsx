import type { ViewId } from "./navigation";
import Sidebar from "./components/Sidebar";
import type { Bucket } from "./types/bucket";
import { useEffect, useState } from "react";
import BucketsView from "./views/BucketsView";

export default function App() {
    const [activeView, setActiveView] = useState<ViewId>("inbox");
    const [buckets, setBuckets] = useState<Bucket[]>([]);

    const [bucketLoadError, setBucketLoadError] = useState("");

    useEffect(() => {
      let active = true;

      window.maildock.listBuckets()
        .then((savedBuckets) => {
          if (active) {
            setBuckets(savedBuckets);
         }
       })
       .catch((error: unknown) => {
         console.error("Failed to load buckets:", error);

         if (active) {
           setBucketLoadError("Could not load saved buckets. Restart MailDock to retry.");
        }
      });

      return () => {
       active = false;
      };
}, []);

    async function createBucket(name: string): Promise<void> {
        const savedBucket = await window.maildock.createBucket(name);

        setBuckets((current) => [...current, savedBucket]);
    }

    function removeBucket(bucketId: string) {
        setBuckets((current) => 
            current.filter((bucket) => bucket.id !== bucketId));
    }

    function renameBucket(bucketId: string, name: string): string | null {
        const trimmedName = name.trim();

        if (!trimmedName) return "Bucket name cannot be empty.";
        if (trimmedName.length > 60) return "Bucket name cannot exceed 60 characters.";

        const duplicate = buckets.some(
            (bucket) => bucket.id !== bucketId && bucket.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (duplicate) return "A bucket with that name already exists.";

        setBuckets((current) =>
            current.map((bucket) =>
                bucket.id === bucketId ? { ...bucket, name: trimmedName } : bucket
            )
        );

        return null;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />

            <main className="min-w-0 flex-1">
                {bucketLoadError && (
                    <p role="alert" className="mb-4 text-sm text-red-400">
                        {bucketLoadError}
                    </p>
                )}

                {activeView === "inbox" ? (
                    <>
                        <h1>Inbox</h1>
                        <p>Your messages will appear here once an account is connected.</p>
                    </>
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