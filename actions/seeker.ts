"use server";

import { FileType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { applicationSchema, messageSchema, seekerProfileSchema } from "@/lib/validation";
import { storeUpload } from "@/lib/uploads";

export async function updateSeekerProfileAction(formData: FormData) {
  const user = await requireRole("SEEKER");

  const parsed = seekerProfileSchema.safeParse({
    phone: formData.get("phone") || undefined,
    location: formData.get("location") || undefined,
    bio: formData.get("bio") || undefined,
    preferredRoles: formData.get("preferredRoles") || undefined,
    availability: formData.get("availability") || undefined,
    workEligibility: formData.get("workEligibility") || undefined,
  });

  if (!parsed.success) {
    redirect(`/seeker/profile?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid profile")}`);
  }

  const profile = await db.jobSeekerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/seeker/dashboard?error=Profile not found");

  let cvFileId = profile.cvFileId || undefined;
  let coverFileId = profile.coverFileId || undefined;
  let profilePhotoId = profile.profilePhotoId || undefined;

  const cv = formData.get("cv") as File;
  const cover = formData.get("cover") as File;
  const photo = formData.get("photo") as File;

  if (cv && cv.size > 0) cvFileId = (await storeUpload(cv, user.id, FileType.CV))?.id;
  if (cover && cover.size > 0) coverFileId = (await storeUpload(cover, user.id, FileType.COVER_LETTER))?.id;
  if (photo && photo.size > 0) profilePhotoId = (await storeUpload(photo, user.id, FileType.PROFILE_PHOTO))?.id;

  await db.jobSeekerProfile.update({
    where: { id: profile.id },
    data: {
      ...parsed.data,
      cvFileId,
      coverFileId,
      profilePhotoId,
    },
  });

  revalidatePath("/seeker/profile");
  redirect("/seeker/profile?success=Profile updated");
}

export async function toggleSavedJobAction(formData: FormData) {
  const user = await requireRole("SEEKER");
  const jobId = String(formData.get("jobId") || "");
  if (!jobId) return;

  const existing = await db.savedJob.findFirst({ where: { seekerId: user.id, jobId } });
  if (existing) {
    await db.savedJob.delete({ where: { id: existing.id } });
  } else {
    await db.savedJob.create({ data: { seekerId: user.id, jobId } });
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/seeker/saved");
}

export async function applyToJobAction(formData: FormData) {
  const user = await requireRole("SEEKER");
  const parsed = applicationSchema.safeParse({
    jobId: formData.get("jobId"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    redirect(`/jobs/${String(formData.get("jobId") || "")}?error=Invalid application`);
  }

  const job = await db.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job || job.status !== "PUBLISHED") {
    redirect(`/jobs/${parsed.data.jobId}?error=This job is unavailable`);
  }

  const profile = await db.jobSeekerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect(`/jobs/${parsed.data.jobId}?error=Please complete your profile first`);

  let cvFileId: string | null = profile.cvFileId;
  const cv = formData.get("cv") as File;
  if (cv && cv.size > 0) {
    cvFileId = (await storeUpload(cv, user.id, FileType.CV))?.id ?? null;
    await db.jobSeekerProfile.update({ where: { id: profile.id }, data: { cvFileId } });
  }

  if (!cvFileId) {
    redirect(`/jobs/${parsed.data.jobId}?error=Upload your CV before applying`);
  }

  let coverLetterId: string | null = profile.coverFileId;
  const cover = formData.get("cover") as File;
  if (cover && cover.size > 0) {
    coverLetterId = (await storeUpload(cover, user.id, FileType.COVER_LETTER))?.id ?? null;
    await db.jobSeekerProfile.update({ where: { id: profile.id }, data: { coverFileId: coverLetterId } });
  }

  const existing = await db.application.findFirst({ where: { jobId: parsed.data.jobId, seekerId: user.id } });
  if (existing) {
    redirect(`/jobs/${parsed.data.jobId}?error=You already applied for this role`);
  }

  const application = await db.application.create({
    data: {
      jobId: parsed.data.jobId,
      seekerId: user.id,
      cvFileId,
      coverLetterId,
      note: parsed.data.note,
    },
    include: { job: true },
  });

  await db.conversation.create({
    data: {
      applicationId: application.id,
      jobId: application.jobId,
      employerId: application.job.employerId,
      seekerId: user.id,
      messages: {
        create: {
          senderId: user.id,
          body: parsed.data.note || "Hi, I have just applied and I am interested in this position.",
        },
      },
    },
  });

  revalidatePath(`/jobs/${parsed.data.jobId}`);
  revalidatePath("/seeker/applications");
  revalidatePath("/employer/applications");
  redirect(`/seeker/applications?success=Application submitted`);
}

export async function sendSeekerMessageAction(formData: FormData) {
  const user = await requireRole("SEEKER");

  const parsed = messageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });

  if (!parsed.success) return;

  const conversation = await db.conversation.findUnique({ where: { id: parsed.data.conversationId } });
  if (!conversation || conversation.seekerId !== user.id) return;

  await db.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user.id,
      body: parsed.data.body,
    },
  });

  await db.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
  revalidatePath("/seeker/messages");
  revalidatePath("/employer/messages");
}
