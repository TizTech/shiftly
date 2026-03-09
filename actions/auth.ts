"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, clearSession } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation";

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid input")}`);
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) {
    redirect("/register?error=An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await db.user.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: parsed.data.role,
      employerProfile:
        parsed.data.role === "EMPLOYER"
          ? {
              create: {
                contactEmail: parsed.data.email.toLowerCase(),
              },
            }
          : undefined,
      seekerProfile: parsed.data.role === "SEEKER" ? { create: {} } : undefined,
    },
  });

  await createSession({ userId: user.id, role: user.role }, true);
  redirect(user.role === "EMPLOYER" ? "/employer/dashboard" : "/seeker/dashboard");
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  });

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0]?.message || "Invalid credentials")}`);
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    redirect("/login?error=Invalid email or password");
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    redirect("/login?error=Invalid email or password");
  }

  await createSession({ userId: user.id, role: user.role }, parsed.data.remember);
  redirect(user.role === "EMPLOYER" ? "/employer/dashboard" : "/seeker/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
