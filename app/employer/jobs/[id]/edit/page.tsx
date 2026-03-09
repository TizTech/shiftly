import { notFound } from "next/navigation";
import { updateJobAction } from "@/actions/employer";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Flash } from "@/components/ui/flash";
import { JobForm } from "@/components/dashboard/job-form";

export default async function EditEmployerJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole("EMPLOYER");
  const { id } = await params;
  const { error } = await searchParams;

  const job = await db.job.findUnique({ where: { id } });
  if (!job || job.employerId !== user.id) notFound();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="font-display text-2xl font-bold text-slate-900">Edit job</h1>
        <div className="mt-4"><Flash error={error} /></div>
      </div>
      <JobForm action={updateJobAction} job={job} />
    </div>
  );
}
