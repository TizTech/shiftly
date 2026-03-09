import { Job, JobStatus } from "@prisma/client";
import { jobCategories } from "@/lib/constants";

type Props = {
  action: (formData: FormData) => void;
  job?: Job;
};

export function JobForm({ action, job }: Props) {
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {job ? <input type="hidden" name="id" value={job.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Job title</label>
          <input name="title" defaultValue={job?.title} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
          <input name="location" defaultValue={job?.location} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select name="category" defaultValue={job?.category} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            {jobCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Job type</label>
          <select name="jobType" defaultValue={job?.jobType || "PART_TIME"} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="PART_TIME">Part-time</option>
            <option value="WEEKEND">Weekend</option>
            <option value="EVENING">Evening</option>
            <option value="TEMPORARY">Temporary</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="CASUAL">Casual</option>
            <option value="SEASONAL">Seasonal</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Work mode</label>
          <select name="workMode" defaultValue={job?.workMode || "ONSITE"} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="ONSITE">On-site</option>
            <option value="HYBRID">Hybrid</option>
            <option value="REMOTE">Remote</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Salary / Rate</label>
          <input name="salary" defaultValue={job?.salary} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Shift pattern</label>
          <input name="shiftInfo" defaultValue={job?.shiftInfo || ""} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Vacancies</label>
          <input name="vacancies" type="number" min={1} max={100} defaultValue={job?.vacancies || 1} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea name="description" defaultValue={job?.description} rows={4} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Responsibilities</label>
        <textarea name="responsibilities" defaultValue={job?.responsibilities} rows={4} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Requirements</label>
        <textarea name="requirements" defaultValue={job?.requirements} rows={4} required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Benefits</label>
        <textarea name="benefits" defaultValue={job?.benefits || ""} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Application deadline</label>
          <input
            name="applicationDeadline"
            type="date"
            defaultValue={job?.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0, 10) : ""}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select name="status" defaultValue={job?.status || JobStatus.PUBLISHED} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-700">
        <label className="inline-flex items-center gap-2"><input type="checkbox" name="studentFriendly" defaultChecked={job?.studentFriendly ?? true} /> Student friendly</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" name="immediateStart" defaultChecked={job?.immediateStart ?? false} /> Immediate start</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" name="urgentHiring" defaultChecked={job?.urgentHiring ?? false} /> Urgent hiring</label>
      </div>

      <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
        {job ? "Update Job" : "Publish Job"}
      </button>
    </form>
  );
}
