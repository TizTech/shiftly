import { JobType } from "@prisma/client";

export const jobCategories = [
  "Bar Staff",
  "Retail Assistant",
  "Waiter / Waitress",
  "Warehouse Operative",
  "Cleaner",
  "Kitchen Assistant",
  "Delivery Driver",
  "Receptionist",
  "Hotel Staff",
  "Café Assistant",
] as const;

export const jobTypeOptions: { label: string; value: JobType }[] = [
  { label: "Part-time", value: "PART_TIME" },
  { label: "Weekend", value: "WEEKEND" },
  { label: "Evening", value: "EVENING" },
  { label: "Temporary", value: "TEMPORARY" },
  { label: "Full-time", value: "FULL_TIME" },
  { label: "Casual", value: "CASUAL" },
  { label: "Seasonal", value: "SEASONAL" },
];

export const locations = [
  "Manchester",
  "Salford",
  "Stockport",
  "Trafford",
  "Deansgate",
  "Didsbury",
  "Chorlton",
  "Oxford Road",
];

export const siteStats = [
  { label: "Active local jobs", value: "1,200+" },
  { label: "Student applications", value: "18k+" },
  { label: "Hiring businesses", value: "450+" },
  { label: "Avg. first response", value: "< 24h" },
];
