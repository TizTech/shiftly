import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Clock, MapPin, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { applyToJobAction, toggleSavedJobAction } from "@/actions/seeker";
import { JobCard } from "@/components/jobs/job-card";
import { Flash } from "@/components/ui/flash";

export default async function JobDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const job = await db.job.findUnique({
    where: { id },
    include: {
      company: true,
      applications: true,
    },
  });

  if (!job || job.status !== "PUBLISHED") notFound();

  const [user, similar] = await Promise.all([
    getCurrentUser(),
    db.job.findMany({
      where: { id: { not: job.id }, status: "PUBLISHED", category: job.category },
      include: { company: true },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const saved = user?.role === "SEEKER" ? await db.savedJob.findFirst({ where: { seekerId: user.id, jobId: id } }) : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{job.category}</p>
              <h1 className="mt-1 font-display text-3xl font-bold text-slate-950">{job.title}</h1>
              <p className="mt-1 text-slate-600">{job.company.name}</p>
            </div>
            <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{job.salary}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">{job.jobType.replaceAll("_", " ")}</span>
            {job.studentFriendly ? <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-medium text-indigo-700">Student friendly</span> : null}
            {job.immediateStart ? <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700">Immediate start</span> : null}
            {job.urgentHiring ? <span className="rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-700">Urgent hiring</span> : null}
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {job.location}</p>
            <p className="inline-flex items-center gap-2"><Wallet className="h-4 w-4" /> {job.salary}</p>
            <p className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> {job.shiftInfo || "Flexible shifts"}</p>
            <p className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Deadline: {job.applicationDeadline ? job.applicationDeadline.toLocaleDateString() : "Open"}</p>
          </div>

          <section className="mt-8 space-y-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">Role summary</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{job.description}</p>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Responsibilities</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{job.responsibilities}</p>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Requirements</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{job.requirements}</p>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">Benefits</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{job.benefits || "Training provided, supportive local team, shift flexibility."}</p>
            </div>
          </section>
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Flash error={error} />
            {user?.role === "SEEKER" ? (
              <form action={applyToJobAction} className="space-y-3" encType="multipart/form-data">
                <input type="hidden" name="jobId" value={job.id} />
                <h2 className="font-display text-lg font-semibold text-slate-900">Apply now</h2>
                <textarea name="note" rows={4} placeholder="Optional cover note" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Upload CV (optional if profile has one)</label>
                  <input type="file" name="cv" accept=".pdf,.doc,.docx" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Cover letter file (optional)</label>
                  <input type="file" name="cover" accept=".pdf,.doc,.docx" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <button className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">Submit application</button>
              </form>
            ) : (
              <div className="space-y-3 text-sm text-slate-600">
                <p>Login as a job seeker to apply instantly.</p>
                <Link href="/login" className="inline-block rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">Login</Link>
              </div>
            )}

            {user?.role === "SEEKER" ? (
              <form action={toggleSavedJobAction} className="mt-3">
                <input type="hidden" name="jobId" value={job.id} />
                <button className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {saved ? "Unsave job" : "Save job"}
                </button>
              </form>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="font-display text-lg font-semibold text-slate-900">Similar jobs</h2>
            <div className="mt-3 space-y-3">
              {similar.map((item) => (
                <JobCard key={item.id} job={item} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
