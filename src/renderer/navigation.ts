export type ViewId = "inbox" | "buckets";

export const navigationItems: { id: ViewId; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "buckets", label: "Smart Buckets" },
];