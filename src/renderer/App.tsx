import type { ViewId } from "./navigation";
import Sidebar from "./components/Sidebar";
import { useState } from "react";
import BucketsView from "./views/BucketsView";

export default function App() {
    const [activeView, setActiveView] = useState<ViewId>("inbox");

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
                    <BucketsView />
                )}
            </main>
        </div>
    );
}