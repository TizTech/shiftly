import { DashboardSidebar } from "@/components/dashboard/sidebar";

const employerItems = [
  { href: "/employer/dashboard", label: "Overview" },
  { href: "/employer/jobs", label: "My Jobs" },
  { href: "/employer/jobs/new", label: "Create Job" },
  { href: "/employer/applications", label: "Applications" },
  { href: "/employer/messages", label: "Messages" },
  { href: "/employer/company", label: "Company" },
];

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <DashboardSidebar items={employerItems} />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
