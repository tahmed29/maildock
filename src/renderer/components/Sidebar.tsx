export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950 p-5">
      <div className="text-xl font-semibold tracking-wide text-sky-400">
        MailDock
      </div>

      <nav aria-label="Main navigation" className="mt-8">
        <button
          type="button"
          aria-current="page"
          className="w-full rounded-lg bg-sky-400/10 px-3 py-2 text-left text-sm font-medium text-sky-300"
        >
          Inbox
        </button>
      </nav>
    </aside>
  );
}