import type { ViewId } from "./navigation";
import Sidebar from "./components/Sidebar";
import { useState } from "react";

export default function App() {
    const [activeView, setActiveView] = useState<ViewId>("inbox");

    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />

            <main className="min-w-0 flex-1">
                <h1>{activeView === "inbox" ? "Inbox" : "Smart Buckets"}</h1>
                <p>{activeView === "inbox" 
                    ? "Your messages will appear here once an account is connected." 
                    : "Create custom buckets to organize your mail with routing rules."}
                </p>
            </main>
        </div>
    );
}