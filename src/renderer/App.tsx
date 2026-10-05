import type { ViewId } from "./navigation";
import Sidebar from "./components/Sidebar";
import type { Bucket } from "./types/bucket";
import { useState } from "react";
import BucketsView from "./views/BucketsView";

export default function App() {
    const [activeView, setActiveView] = useState<ViewId>("inbox");
    const [buckets, setBuckets] = useState<Bucket[]>([]);

    function createBucket(name: string) {
        setBuckets((current) => [
            ...current, 
            { id: crypto.randomUUID(), name }
        ]);
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />

            <main className="min-w-0 flex-1">
                {activeView === "inbox" ? (
                    <>
                        <h1>Inbox</h1>
                        <p>Your messages will appear here once an account is connected.</p>
                    </>
                ) : (
                    <BucketsView buckets={buckets} onCreate={createBucket} />
                )}
            </main>
        </div>
    );
}