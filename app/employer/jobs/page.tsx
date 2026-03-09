import Link from "next/link";
import { closeJobAction, deleteJobAction } from "@/actions/employer";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Flash } from "@/components/ui/flash";

export default async function EmployerJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireRole("EMPLOYER");
  const { error, success } = await searchParams;

  const jobs = await db.job.findMany({
    where: { employerId: user.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-slate-900">My jobs</h1>
          <Link href="/employer/jobs/new" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Create job</Link>
        </div>
        <div className="mt-4"><Flash error={error} success={success} /></div>
      </div>

      <div className="space-y-3">
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No jobs posted yet.</div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">{job.title}</h2>
                  <p className="text-sm text-slate-600">{job.location} • {job.salary}</p>
                </div>
                <p className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{job.status}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{job._count.applications} applications</span>
                <Link href={`/employer/jobs/${job.id}/edit`} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">Edit</Link>
                <form action={closeJobAction}>
                  <input type="hidden" name="id" value={job.id} />
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">Close</button>
                </form>
                <form action={deleteJobAction}>
                  <input type="hidden" name="id" value={job.id} />
                  <button className="rounded-lg border border-rose-200 px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-50">Delete</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
