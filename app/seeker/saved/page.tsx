import { toggleSavedJobAction } from "@/actions/seeker";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobCard } from "@/components/jobs/job-card";

export default async function SeekerSavedPage() {
  const user = await requireRole("SEEKER");

  const savedJobs = await db.savedJob.findMany({
    where: { seekerId: user.id },
    include: { job: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-bold text-slate-900">Saved jobs</h1>
      {savedJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No saved jobs yet.</div>
      ) : (
        savedJobs.map(({ job }) => (
          <div key={job.id} className="space-y-2">
            <JobCard job={job} />
            <form action={toggleSavedJobAction}>
              <input type="hidden" name="jobId" value={job.id} />
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Remove from saved</button>
            </form>
          </div>
        ))
      )}
    </div>
  );
}
