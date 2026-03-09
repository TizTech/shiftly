import { createJobAction } from "@/actions/employer";
import { requireRole } from "@/lib/auth";
import { Flash } from "@/components/ui/flash";
import { JobForm } from "@/components/dashboard/job-form";

export default async function NewEmployerJobPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("EMPLOYER");
  const { error } = await searchParams;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="font-display text-2xl font-bold text-slate-900">Create job post</h1>
        <p className="mt-1 text-sm text-slate-600">Publish a local role and start receiving applications quickly.</p>
        <div className="mt-4"><Flash error={error} /></div>
      </div>
      <JobForm action={createJobAction} />
    </div>
  );
}
