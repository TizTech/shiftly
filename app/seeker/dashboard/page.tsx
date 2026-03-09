import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SeekerDashboardPage() {
  const user = await requireRole("SEEKER");

  const [savedCount, applicationsCount, chatsCount, reviewedCount] = await Promise.all([
    db.savedJob.count({ where: { seekerId: user.id } }),
    db.application.count({ where: { seekerId: user.id } }),
    db.conversation.count({ where: { seekerId: user.id } }),
    db.application.count({ where: { seekerId: user.id, status: { in: ["REVIEWED", "SHORTLISTED", "HIRED"] } } }),
  ]);

  const recentApplications = await db.application.findMany({
    where: { seekerId: user.id },
    include: { job: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-slate-900">Job seeker dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Welcome back, {user.fullName}. Track your progress and stay responsive.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Saved jobs" value={String(savedCount)} />
          <StatCard label="Applications" value={String(applicationsCount)} />
          <StatCard label="Reviewed" value={String(reviewedCount)} />
          <StatCard label="Active chats" value={String(chatsCount)} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-slate-900">Recent applications</h2>
          <Link href="/seeker/applications" className="text-sm font-semibold text-emerald-700">View all</Link>
        </div>
        <div className="mt-3 space-y-3">
          {recentApplications.length === 0 ? (
            <p className="text-sm text-slate-600">No applications yet. Start browsing local jobs.</p>
          ) : (
            recentApplications.map((application) => (
              <div key={application.id} className="rounded-xl border border-slate-200 p-3">
                <h3 className="font-semibold text-slate-900">{application.job.title}</h3>
                <p className="text-sm text-slate-600">{application.job.company.name} • {application.job.location}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Status: {application.status}</p>
              </div>
            ))
          )}
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
