import { updateSeekerProfileAction } from "@/actions/seeker";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Flash } from "@/components/ui/flash";
import { InputHTMLAttributes } from "react";

export default async function SeekerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireRole("SEEKER");
  const { error, success } = await searchParams;

  const profile = await db.jobSeekerProfile.findUnique({
    where: { userId: user.id },
    include: { cvFile: true, coverFile: true, profilePhoto: true },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="font-display text-2xl font-bold text-slate-900">Profile settings</h1>
        <p className="mt-1 text-sm text-slate-600">Keep your profile complete to apply faster.</p>
        <div className="mt-4"><Flash error={error} success={success} /></div>
      </div>

      <form action={updateSeekerProfileAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5" encType="multipart/form-data">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" name="fullName" defaultValue={user.fullName} disabled />
          <Field label="Email" name="email" defaultValue={user.email} disabled />
          <Field label="Phone" name="phone" defaultValue={profile?.phone || ""} />
          <Field label="Location" name="location" defaultValue={profile?.location || ""} />
          <Field label="Availability" name="availability" defaultValue={profile?.availability || ""} />
          <Field label="Work eligibility" name="workEligibility" defaultValue={profile?.workEligibility || ""} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Preferred roles</label>
          <input name="preferredRoles" defaultValue={profile?.preferredRoles || ""} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Retail, bar staff, café assistant" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Short bio</label>
          <textarea name="bio" defaultValue={profile?.bio || ""} rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <UploadField label="CV" name="cv" current={profile?.cvFile?.originalName} />
          <UploadField label="Cover Letter" name="cover" current={profile?.coverFile?.originalName} />
          <UploadField label="Profile Photo" name="photo" current={profile?.profilePhoto?.originalName} accept="image/*" />
        </div>

        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Save profile</button>
      </form>
    </div>
  );
}

function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input {...props} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100" />
    </div>
  );
}

function UploadField({ label, name, current, accept }: { label: string; name: string; current?: string; accept?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input type="file" name={name} accept={accept || ".pdf,.doc,.docx"} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      {current ? <p className="mt-1 text-xs text-slate-500">Current: {current}</p> : null}
    </div>
  );
}
