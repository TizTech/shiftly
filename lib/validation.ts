import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SEEKER", "EMPLOYER"]),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const companySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().min(2),
  contactEmail: z.email(),
  website: z.string().url().optional().or(z.literal("")),
  companySize: z.string().optional(),
  hiringPreferences: z.string().optional(),
});

export const jobSchema = z.object({
  title: z.string().min(3),
  location: z.string().min(2),
  category: z.string().min(2),
  jobType: z.enum(["PART_TIME", "WEEKEND", "EVENING", "TEMPORARY", "FULL_TIME", "CASUAL", "SEASONAL"]),
  workMode: z.enum(["ONSITE", "HYBRID", "REMOTE"]),
  salary: z.string().min(2),
  shiftInfo: z.string().optional(),
  description: z.string().min(20),
  responsibilities: z.string().min(20),
  requirements: z.string().min(20),
  benefits: z.string().optional(),
  vacancies: z.coerce.number().int().min(1).max(100),
  studentFriendly: z.boolean().optional(),
  immediateStart: z.boolean().optional(),
  urgentHiring: z.boolean().optional(),
  applicationDeadline: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
});

export const applicationSchema = z.object({
  jobId: z.string().min(1),
  note: z.string().max(500).optional(),
});

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1).max(1200),
});

export const seekerProfileSchema = z.object({
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(400).optional(),
  preferredRoles: z.string().optional(),
  availability: z.string().optional(),
  workEligibility: z.string().optional(),
});
