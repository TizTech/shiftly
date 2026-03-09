import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">This page does not exist or has moved.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        Back to home
      </Link>
    </div>
  );
}
