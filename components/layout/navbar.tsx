import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export async function Navbar() {
  const user = await getCurrentUser();
  const dashboardHref = user?.role === "EMPLOYER" ? "/employer/dashboard" : "/seeker/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex flex-col leading-none text-slate-900">
          <span className="font-display text-2xl font-black tracking-tight text-slate-950">
            Shift<span className="text-emerald-600">ly</span>
          </span>
          <span className="mt-1 h-0.5 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-200 group-hover:w-20" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/jobs" className="text-sm font-medium text-slate-700 transition hover:text-slate-950">
            Browse Jobs
          </Link>
          <Link href="/employer/jobs/new" className="text-sm font-medium text-slate-700 transition hover:text-slate-950">
            Post a Job
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Login
              </Link>
              <Link href="/register" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
