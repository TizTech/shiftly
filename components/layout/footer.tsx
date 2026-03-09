import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900">Shiftly</h3>
          <p className="mt-2 text-sm text-slate-600">
            Premium local job board for students and flexible workers.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">For seekers</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/jobs">Find jobs</Link></li>
            <li><Link href="/seeker/dashboard">Dashboard</Link></li>
            <li><Link href="/seeker/applications">Applications</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">For employers</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/employer/jobs/new">Post a role</Link></li>
            <li><Link href="/employer/applications">Applications</Link></li>
            <li><Link href="/employer/messages">Messages</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>About</li>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
