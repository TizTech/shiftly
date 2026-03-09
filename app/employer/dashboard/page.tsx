import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EmployerDashboardPage() {
  const user = await requireRole("EMPLOYER");

  const [jobsCount, activeJobsCount, applicationsCount, conversationsCount] = await Promise.all([
    db.job.count({ where: { employerId: user.id } }),
    db.job.count({ where: { employerId: user.id, status: "PUBLISHED" } }),
    db.application.count({ where: { job: { employerId: user.id } } }),
    db.conversation.count({ where: { employerId: user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-slate-900">Employer dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Welcome back, {user.fullName}. Manage local hiring in one place.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total jobs" value={String(jobsCount)} />
          <StatCard label="Live jobs" value={String(activeJobsCount)} />
          <StatCard label="Applications" value={String(applicationsCount)} />
          <StatCard label="Conversations" value={String(conversationsCount)} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-xl font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/employer/jobs/new" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Post new job</Link>
          <Link href="/employer/applications" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Review applicants</Link>
          <Link href="/employer/messages" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Open inbox</Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
