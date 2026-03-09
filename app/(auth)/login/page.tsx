import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { Flash } from "@/components/ui/flash";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100">
        <h1 className="font-display text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">Log in to manage applications and messages.</p>

        <div className="mt-4"><Flash error={error} /></div>

        <form action={loginAction} className="mt-4 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input id="password" name="password" type="password" required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="remember" className="h-4 w-4 rounded border-slate-300" />
            Remember me
          </label>
          <button className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Login</button>
        </form>

        <p className="mt-4 text-sm text-slate-600">No account yet? <Link href="/register" className="font-semibold text-emerald-700">Create one</Link></p>
      </div>
    </div>
  );
}
