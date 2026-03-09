import Link from "next/link";
import { ArrowRight, Building2, Clock3, MapPin, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { jobCategories, siteStats } from "@/lib/constants";
import { JobCard } from "@/components/jobs/job-card";

export default async function HomePage() {
  const featuredJobs = await db.job.findMany({
    where: { status: "PUBLISHED" },
    include: { company: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div>
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pt-18">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" /> Trusted by local employers
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Find nearby part-time jobs that fit your life.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Shiftly helps students and young adults land flexible local roles fast: bars, retail, hospitality,
              warehouses, cafés, and more.
            </p>
            <form action="/jobs" className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-100 sm:grid-cols-2">
              <input name="q" placeholder="Job title or keyword" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input name="location" placeholder="Location (e.g. Manchester)" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <select name="category" className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2">
                <option value="">All categories</option>
                {jobCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 sm:col-span-2">
                Find Jobs
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/jobs" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">
                Find Jobs
              </Link>
              <Link href="/employer/jobs/new" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Post a Job
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/70">
            <h2 className="font-display text-xl font-bold text-slate-900">Why job seekers choose Shiftly</h2>
            <ul className="mt-5 space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-emerald-600" /> Local roles close to uni, home or city centre</li>
              <li className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 text-emerald-600" /> Flexible shifts: evening, weekend, casual, seasonal</li>
              <li className="flex items-start gap-3"><Building2 className="mt-0.5 h-4 w-4 text-emerald-600" /> Direct employer messaging after you apply</li>
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {siteStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-slate-50 p-3">
                  <p className="font-display text-2xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-900">Popular categories</h2>
          <Link href="/jobs" className="text-sm font-semibold text-slate-700 hover:text-slate-900">See all</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {jobCategories.map((cat) => (
            <Link key={cat} href={`/jobs?category=${encodeURIComponent(cat)}`} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm hover:border-emerald-300 hover:text-emerald-700">
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-900">Featured local jobs</h2>
          <Link href="/jobs" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Browse all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredJobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </section>

      <section className="mx-auto mb-14 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10">
          <h3 className="font-display text-3xl font-bold">Need staff quickly this week?</h3>
          <p className="mt-3 max-w-2xl text-slate-300">Post your role in minutes and start chatting with local applicants inside Shiftly.</p>
          <Link href="/employer/jobs/new" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
            Post a Job
          </Link>
        </div>
      </section>
    </div>
  );
}
