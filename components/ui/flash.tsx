export function Flash({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;

  return (
    <div
      className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error || success}
    </div>
  );
}
