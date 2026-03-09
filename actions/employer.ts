"use server";

import { ApplicationStatus, FileType, JobStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { companySchema, jobSchema, messageSchema } from "@/lib/validation";
import { storeUpload } from "@/lib/uploads";

export async function upsertCompanyAction(formData: FormData) {
  const user = await requireRole("EMPLOYER");
  const websiteInput = String(formData.get("website") || "").trim();
  const normalizedWebsite =
    websiteInput && !/^https?:\/\//i.test(websiteInput) ? `https://${websiteInput}` : websiteInput;

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    industry: formData.get("industry") || undefined,
    location: formData.get("location"),
    contactEmail: formData.get("contactEmail"),
    website: normalizedWebsite,
    companySize: formData.get("companySize") || undefined,
    hiringPreferences: formData.get("hiringPreferences") || undefined,
  });

  if (!parsed.success) {
    redirect(`/employer/company?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid company details")}`);
  }

  const profile = await db.employerProfile.findUnique({ where: { userId: user.id }, include: { company: true } });
  if (!profile) redirect("/employer/dashboard?error=Employer profile not found");

  let logoFileId = profile.company?.logoFileId || undefined;
  const logo = formData.get("logo") as File;
  if (logo && logo.size > 0) {
    const upload = await storeUpload(logo, user.id, FileType.LOGO);
    logoFileId = upload?.id;
  }

  try {
    const { hiringPreferences, ...companyData } = parsed.data;

    await db.$transaction([
      db.employerProfile.update({
        where: { id: profile.id },
        data: { hiringPreferences: hiringPreferences || undefined },
      }),
      db.company.upsert({
        where: { employerProfileId: profile.id },
        update: {
          ...companyData,
          website: companyData.website || undefined,
          logoFileId,
        },
        create: {
          employerProfileId: profile.id,
          ...companyData,
          website: companyData.website || undefined,
          logoFileId,
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to save company profile", { employerId: user.id, error });
    redirect("/employer/company?error=Could not save company profile");
  }

  revalidatePath("/employer/company");
  redirect("/employer/company?success=Company profile saved");
}

export async function createJobAction(formData: FormData) {
  const user = await requireRole("EMPLOYER");

  const profile = await db.employerProfile.findUnique({
    where: { userId: user.id },
    include: { company: true },
  });

  if (!profile?.company) {
    redirect("/employer/company?error=Create your company profile before posting jobs");
  }

  const parsed = jobSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    category: formData.get("category"),
    jobType: formData.get("jobType"),
    workMode: formData.get("workMode"),
    salary: formData.get("salary"),
    shiftInfo: formData.get("shiftInfo") || undefined,
    description: formData.get("description"),
    responsibilities: formData.get("responsibilities"),
    requirements: formData.get("requirements"),
    benefits: formData.get("benefits") || undefined,
    vacancies: formData.get("vacancies"),
    studentFriendly: formData.get("studentFriendly") === "on",
    immediateStart: formData.get("immediateStart") === "on",
    urgentHiring: formData.get("urgentHiring") === "on",
    applicationDeadline: (formData.get("applicationDeadline") as string) || undefined,
    status: formData.get("status") || JobStatus.PUBLISHED,
  });

  if (!parsed.success) {
    redirect(`/employer/jobs/new?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid job details")}`);
  }

  await db.job.create({
    data: {
      ...parsed.data,
      applicationDeadline: parsed.data.applicationDeadline ? new Date(parsed.data.applicationDeadline) : null,
      employerId: user.id,
      companyId: profile.company.id,
    },
  });

  revalidatePath("/jobs");
  redirect("/employer/jobs?success=Job posted");
}

export async function updateJobAction(formData: FormData) {
  const user = await requireRole("EMPLOYER");
  const id = String(formData.get("id") || "");
  const job = await db.job.findUnique({ where: { id } });
  if (!job || job.employerId !== user.id) redirect("/employer/jobs?error=Job not found");

  const parsed = jobSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location"),
    category: formData.get("category"),
    jobType: formData.get("jobType"),
    workMode: formData.get("workMode"),
    salary: formData.get("salary"),
    shiftInfo: formData.get("shiftInfo") || undefined,
    description: formData.get("description"),
    responsibilities: formData.get("responsibilities"),
    requirements: formData.get("requirements"),
    benefits: formData.get("benefits") || undefined,
    vacancies: formData.get("vacancies"),
    studentFriendly: formData.get("studentFriendly") === "on",
    immediateStart: formData.get("immediateStart") === "on",
    urgentHiring: formData.get("urgentHiring") === "on",
    applicationDeadline: (formData.get("applicationDeadline") as string) || undefined,
    status: formData.get("status") || JobStatus.PUBLISHED,
  });

  if (!parsed.success) {
    redirect(`/employer/jobs/${id}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid job details")}`);
  }

  await db.job.update({
    where: { id },
    data: {
      ...parsed.data,
      applicationDeadline: parsed.data.applicationDeadline ? new Date(parsed.data.applicationDeadline) : null,
    },
  });

  revalidatePath("/jobs");
  redirect("/employer/jobs?success=Job updated");
}

export async function closeJobAction(formData: FormData) {
  const user = await requireRole("EMPLOYER");
  const id = String(formData.get("id") || "");
  await db.job.updateMany({ where: { id, employerId: user.id }, data: { status: "CLOSED" } });
  revalidatePath("/jobs");
  revalidatePath("/employer/jobs");
}

export async function deleteJobAction(formData: FormData) {
  const user = await requireRole("EMPLOYER");
  const id = String(formData.get("id") || "");
  await db.job.deleteMany({ where: { id, employerId: user.id } });
  revalidatePath("/jobs");
  revalidatePath("/employer/jobs");
}

export async function updateApplicationStatusAction(formData: FormData) {
  const user = await requireRole("EMPLOYER");
  const applicationId = String(formData.get("applicationId") || "");
  const status = String(formData.get("status") || "") as ApplicationStatus;

  const app = await db.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });

  if (!app || app.job.employerId !== user.id) return;
  await db.application.update({ where: { id: applicationId }, data: { status } });
  revalidatePath("/employer/applications");
  revalidatePath("/seeker/applications");
}

export async function sendEmployerMessageAction(formData: FormData) {
  const user = await requireRole("EMPLOYER");

  const parsed = messageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });

  if (!parsed.success) return;

  const conversation = await db.conversation.findUnique({ where: { id: parsed.data.conversationId } });
  if (!conversation || conversation.employerId !== user.id) return;

  const body = parsed.data.body.trim();
  if (!body) return;

  const lastMessage = await db.message.findFirst({
    where: { conversationId: conversation.id, senderId: user.id },
    orderBy: { createdAt: "desc" },
    select: { body: true, createdAt: true },
  });

  const isRapidDuplicate =
    !!lastMessage &&
    lastMessage.body === body &&
    Date.now() - new Date(lastMessage.createdAt).getTime() < 8_000;

  if (isRapidDuplicate) {
    redirect(`/employer/messages?conversationId=${conversation.id}`);
  }

  await db.$transaction([
    db.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        body,
      },
    }),
    db.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } }),
  ]);

  revalidatePath("/employer/messages");
  revalidatePath("/seeker/messages");
  redirect(`/employer/messages?conversationId=${conversation.id}`);
}
