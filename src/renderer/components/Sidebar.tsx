import { navigationItems, type ViewId} from "../navigation";

type SidebarProps = {
  activeView: ViewId;
  onNavigate: (viewId: ViewId) => void;
};

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950 p-5">
      <div className="text-xl font-semibold tracking-wide text-sky-400">
        MailDock
      </div>

      <nav aria-label="Main navigation" className="mt-8 space-y-1">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={item.id === activeView ? "page" : undefined}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
              item.id === activeView
          ? "bg-sky-400/10 text-sky-300"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
      }`}
    >
      {item.label}
    </button>
  ))}
</nav>
    </aside>
  );
}