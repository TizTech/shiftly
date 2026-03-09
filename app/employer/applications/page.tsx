import Link from "next/link";
import { updateApplicationStatusAction } from "@/actions/employer";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EmployerApplicationsPage() {
  const user = await requireRole("EMPLOYER");

  const applications = await db.application.findMany({
    where: { job: { employerId: user.id } },
    include: {
      seeker: { include: { seekerProfile: true } },
      job: true,
      cvFile: true,
      coverLetter: true,
      conversation: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-bold text-slate-900">Applications inbox</h1>
      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">No applications yet.</div>
      ) : (
        applications.map((application) => (
          <div key={application.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">{application.job.title}</p>
                <h2 className="font-semibold text-slate-900">{application.seeker.fullName}</h2>
                <p className="text-sm text-slate-600">{application.seeker.email} • {application.seeker.seekerProfile?.phone || "No phone"}</p>
              </div>
              <p className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{application.status}</p>
            </div>

            {application.note ? <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{application.note}</p> : null}

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <a href={application.cvFile.path} target="_blank" className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">CV: {application.cvFile.originalName}</a>
              {application.coverLetter ? <a href={application.coverLetter.path} target="_blank" className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">Cover letter</a> : null}
              <Link
                href={application.conversation ? `/employer/messages?conversationId=${application.conversation.id}` : "/employer/messages"}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Open chat
              </Link>
            </div>

            <form action={updateApplicationStatusAction} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="applicationId" value={application.id} />
              <select name="status" defaultValue={application.status} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                <option value="SUBMITTED">Submitted</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="REJECTED">Rejected</option>
                <option value="HIRED">Hired</option>
              </select>
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700">Update status</button>
            </form>
          </div>
        ))
      )}
    </div>
  );
}
