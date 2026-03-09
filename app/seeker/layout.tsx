import { DashboardSidebar } from "@/components/dashboard/sidebar";

const seekerItems = [
  { href: "/seeker/dashboard", label: "Overview" },
  { href: "/seeker/profile", label: "Profile" },
  { href: "/seeker/applications", label: "Applications" },
  { href: "/seeker/saved", label: "Saved jobs" },
  { href: "/seeker/messages", label: "Messages" },
];

export default async function SeekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <DashboardSidebar items={seekerItems} />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
