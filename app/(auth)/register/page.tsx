import Link from "next/link";
import { registerAction } from "@/actions/auth";
import { Flash } from "@/components/ui/flash";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
        <h1 className="font-display text-2xl font-bold text-slate-900">Create your Shiftly account</h1>
        <p className="mt-1 text-sm text-slate-600">Choose your role and get started in under a minute.</p>
        <div className="mt-4"><Flash error={error} /></div>

        <form action={registerAction} className="mt-4 space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input id="fullName" name="fullName" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input id="password" name="password" type="password" minLength={8} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">I am joining as</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700">
                <input type="radio" name="role" value="SEEKER" defaultChecked className="mr-2" /> Job seeker
              </label>
              <label className="rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-700">
                <input type="radio" name="role" value="EMPLOYER" className="mr-2" /> Employer
              </label>
            </div>
          </div>
          <button className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Create account</button>
        </form>

        <p className="mt-4 text-sm text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-emerald-700">Login</Link></p>
      </div>
    </div>
  );
}
