import { Prisma } from "@prisma/client";
import Link from "next/link";
import { db } from "@/lib/db";
import { JobCard } from "@/components/jobs/job-card";
import { jobCategories, locations } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { toggleSavedJobAction } from "@/actions/seeker";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "pay_high", label: "Pay high to low" },
  { value: "pay_low", label: "Pay low to high" },
  { value: "relevant", label: "Most relevant" },
];

function parseSalaryNumber(salary: string) {
  const match = salary.match(/\d+/g);
  return match ? Number(match[0]) : 0;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  const q = String(params.q || "").trim();
  const location = String(params.location || "").trim();
  const category = String(params.category || "").trim();
  const jobType = String(params.jobType || "").trim();
  const studentFriendly = params.studentFriendly === "1";
  const immediateStart = params.immediateStart === "1";
  const sort = String(params.sort || "newest");

  const where: Prisma.JobWhereInput = {
    status: "PUBLISHED",
    ...(location ? { location: { contains: location } } : {}),
    ...(category ? { category } : {}),
    ...(jobType ? { jobType: jobType as never } : {}),
    ...(studentFriendly ? { studentFriendly: true } : {}),
    ...(immediateStart ? { immediateStart: true } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { category: { contains: q } },
            { company: { name: { contains: q } } },
          ],
        }
      : {}),
  };

  let jobs = await db.job.findMany({
    where,
    include: { company: true },
    orderBy: sort === "newest" ? { createdAt: "desc" } : { updatedAt: "desc" },
    take: 60,
  });

  if (sort === "pay_high") jobs = [...jobs].sort((a, b) => parseSalaryNumber(b.salary) - parseSalaryNumber(a.salary));
  if (sort === "pay_low") jobs = [...jobs].sort((a, b) => parseSalaryNumber(a.salary) - parseSalaryNumber(b.salary));

  const savedSet = new Set(
    user?.role === "SEEKER"
      ? (await db.savedJob.findMany({ where: { seekerId: user.id } })).map((saved) => saved.jobId)
      : [],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <h1 className="font-display text-xl font-bold text-slate-900">Find local jobs</h1>
          <form className="mt-4 space-y-3" action="/jobs">
            <input name="q" defaultValue={q} placeholder="Keyword" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input name="location" defaultValue={location} placeholder="Location" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <select name="category" defaultValue={category} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">All categories</option>
              {jobCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select name="jobType" defaultValue={jobType} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <option value="">All job types</option>
              <option value="PART_TIME">Part-time</option>
              <option value="WEEKEND">Weekend</option>
              <option value="EVENING">Evening</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="CASUAL">Casual</option>
              <option value="SEASONAL">Seasonal</option>
            </select>
            <select name="sort" defaultValue={sort} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="studentFriendly" value="1" defaultChecked={studentFriendly} /> Student friendly
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="immediateStart" value="1" defaultChecked={immediateStart} /> Immediate start
            </label>
            <button className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Apply filters</button>
            <Link href="/jobs" className="block rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Clear all</Link>
          </form>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Popular areas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {locations.map((place) => (
                <a key={place} href={`/jobs?location=${encodeURIComponent(place)}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
                  {place}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <section>
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            {jobs.length} jobs found
            {q ? ` for "${q}"` : ""}
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h2 className="font-display text-xl font-semibold text-slate-900">No jobs found</h2>
              <p className="mt-2 text-sm text-slate-600">Try broadening your filters or searching another local area.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-2xl">
                  <JobCard job={job} />
                  {user?.role === "SEEKER" ? (
                    <form action={toggleSavedJobAction} className="-mt-3 mr-4 flex justify-end">
                      <input type="hidden" name="jobId" value={job.id} />
                      <button className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow ring-1 ring-slate-200 hover:bg-slate-100">
                        {savedSet.has(job.id) ? "Saved" : "Save"}
                      </button>
                    </form>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
