import Sidebar from "./components/Sidebar";

export default function App() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="min-w-0 flex-1">
                <h1>Inbox</h1>
                <p>Your messages will appear here once an account is connected.</p>
            </main>
        </div>
    );
}