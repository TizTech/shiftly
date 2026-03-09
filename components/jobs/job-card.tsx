import Link from "next/link";
import { Job, Company } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

type JobCardProps = {
  job: Job & { company: Company };
};

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{job.category}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{job.company.name} • {job.location}</p>
        </div>
        <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{job.salary}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">{job.jobType.replaceAll("_", " ")}</span>
        {job.studentFriendly ? <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-medium text-indigo-700">Student friendly</span> : null}
        {job.immediateStart ? <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium text-amber-700">Immediate start</span> : null}
        {job.urgentHiring ? <span className="rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-700">Urgent</span> : null}
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-slate-500">Posted {formatDistanceToNow(job.createdAt, { addSuffix: true })}</p>
        <Link href={`/jobs/${job.id}`} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          View Job
        </Link>
      </div>
    </article>
  );
}
