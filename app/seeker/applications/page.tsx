import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Flash } from "@/components/ui/flash";

export default async function SeekerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await requireRole("SEEKER");
  const { success } = await searchParams;

  const applications = await db.application.findMany({
    where: { seekerId: user.id },
    include: {
      job: { include: { company: true } },
      cvFile: true,
      coverLetter: true,
      conversation: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-bold text-slate-900">My applications</h1>
      {success ? <Flash success={success} /> : null}

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No applications submitted yet.</div>
      ) : (
        applications.map((application) => (
          <div key={application.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">{application.job.title}</h2>
                <p className="text-sm text-slate-600">{application.job.company.name} • {application.job.location}</p>
              </div>
              <p className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{application.status}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <a href={application.cvFile.path} target="_blank" className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">CV file</a>
              {application.coverLetter ? <a href={application.coverLetter.path} target="_blank" className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">Cover letter</a> : null}
              <Link href={`/jobs/${application.job.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">View job</Link>
              <Link
                href={application.conversation ? `/seeker/messages?conversationId=${application.conversation.id}` : "/seeker/messages"}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Open chat
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
