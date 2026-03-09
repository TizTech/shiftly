import { upsertCompanyAction } from "@/actions/employer";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Flash } from "@/components/ui/flash";
import { InputHTMLAttributes } from "react";

export default async function EmployerCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireRole("EMPLOYER");
  const { error, success } = await searchParams;

  const profile = await db.employerProfile.findUnique({
    where: { userId: user.id },
    include: { company: { include: { logoFile: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="font-display text-2xl font-bold text-slate-900">Company profile</h1>
        <p className="mt-1 text-sm text-slate-600">This profile appears on your job posts.</p>
        <div className="mt-4"><Flash error={error} success={success} /></div>
      </div>

      <form action={upsertCompanyAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5" encType="multipart/form-data">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Company name" name="name" defaultValue={profile?.company?.name} required />
          <Field label="Industry" name="industry" defaultValue={profile?.company?.industry || ""} />
          <Field label="Location" name="location" defaultValue={profile?.company?.location} required />
          <Field label="Contact email" name="contactEmail" type="email" defaultValue={profile?.company?.contactEmail || profile?.contactEmail} required />
          <Field label="Website" name="website" defaultValue={profile?.company?.website || ""} />
          <Field label="Company size" name="companySize" defaultValue={profile?.company?.companySize || ""} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea name="description" defaultValue={profile?.company?.description || ""} rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Hiring preferences</label>
          <textarea name="hiringPreferences" defaultValue={profile?.hiringPreferences || ""} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Company logo</label>
          <input type="file" name="logo" accept="image/*" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          {profile?.company?.logoFile ? <a href={profile.company.logoFile.path} target="_blank" className="mt-2 inline-block text-xs font-semibold text-emerald-700">Current logo: {profile.company.logoFile.originalName}</a> : null}
        </div>

        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Save company profile</button>
      </form>
    </div>
  );
}

function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input {...props} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
    </div>
  );
}
