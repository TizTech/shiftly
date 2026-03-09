import bcrypt from "bcryptjs";
import { PrismaClient, ApplicationStatus, JobType } from "@prisma/client";

const prisma = new PrismaClient();

const companies = [
  {
    user: { fullName: "Maya Thompson", email: "maya@northlanebistro.co.uk" },
    company: {
      name: "Northlane Bistro",
      industry: "Hospitality",
      location: "Manchester City Centre",
      description: "Busy independent bistro hiring flexible front-of-house and kitchen staff.",
      companySize: "11-50",
    },
  },
  {
    user: { fullName: "Lewis Carter", email: "lewis@traffordstyle.co.uk" },
    company: {
      name: "Trafford Style",
      industry: "Retail",
      location: "Trafford",
      description: "Fast-paced fashion retail team in Trafford Centre.",
      companySize: "51-200",
    },
  },
  {
    user: { fullName: "Amina Rahman", email: "amina@peaklogistics.co.uk" },
    company: {
      name: "Peak Logistics",
      industry: "Warehousing",
      location: "Stockport",
      description: "Local warehouse operator with day and evening shifts.",
      companySize: "51-200",
    },
  },
  {
    user: { fullName: "Oliver Grant", email: "oliver@deansgatehotel.co.uk" },
    company: {
      name: "Deansgate Hotel",
      industry: "Hotels",
      location: "Deansgate",
      description: "Boutique hotel serving business and weekend guests.",
      companySize: "11-50",
    },
  },
];

const seekerUsers = [
  { fullName: "Sophie Patel", email: "sophie@studentmail.com", location: "Fallowfield", preferredRoles: "Bar staff, café assistant" },
  { fullName: "Ryan Hughes", email: "ryan@studentmail.com", location: "Salford", preferredRoles: "Retail assistant, warehouse operative" },
  { fullName: "Ella Brooks", email: "ella@studentmail.com", location: "Manchester", preferredRoles: "Receptionist, hotel staff" },
];

const templates = [
  {
    title: "Bar Staff",
    category: "Bar Staff",
    salary: "£11.70/hr + tips",
    description: "Friendly venue hiring bar staff for busy student nights and weekend trade.",
    responsibilities: "Serve drinks, keep bar stocked, maintain a clean service area, support team setup/close down.",
    requirements: "Customer-facing confidence, punctuality, right to work in UK, weekend availability preferred.",
    benefits: "Paid training, free staff meal on shift, team socials.",
    shiftInfo: "Evening and weekend shifts",
    jobType: JobType.EVENING,
  },
  {
    title: "Retail Assistant",
    category: "Retail Assistant",
    salary: "£11.44/hr",
    description: "Support daily customer service, merchandising and till operations.",
    responsibilities: "Greeting customers, stock replenishment, till transactions, keeping store tidy.",
    requirements: "Positive attitude, clear communication, able to work standing for long periods.",
    benefits: "Staff discount, fixed weekly rota options.",
    shiftInfo: "Part-time daytime and weekend",
    jobType: JobType.PART_TIME,
  },
  {
    title: "Kitchen Assistant",
    category: "Kitchen Assistant",
    salary: "£12.10/hr",
    description: "Assist prep and cleaning in a high-volume kitchen environment.",
    responsibilities: "Food prep, dishwashing, hygiene checks, stock movement.",
    requirements: "Reliable, can work in fast-paced conditions, food hygiene awareness preferred.",
    benefits: "Meal on shift, uniform provided.",
    shiftInfo: "Mixed shifts, immediate start",
    jobType: JobType.TEMPORARY,
  },
  {
    title: "Warehouse Operative",
    category: "Warehouse Operative",
    salary: "£12.50/hr",
    description: "Join dispatch team for picking, packing and inbound stock processing.",
    responsibilities: "Pick/pack orders, scanner use, pallet movement, maintain safe workspace.",
    requirements: "Attention to detail, basic numeracy, lifting capability.",
    benefits: "Weekly pay and overtime rates.",
    shiftInfo: "Early and late shifts",
    jobType: JobType.CASUAL,
  },
  {
    title: "Hotel Receptionist",
    category: "Receptionist",
    salary: "£12.00/hr",
    description: "Front-desk role handling guest check-ins and bookings.",
    responsibilities: "Check-in/out, guest queries, booking system updates, phone handling.",
    requirements: "Professional communication, basic IT skills, customer-first mindset.",
    benefits: "Free meals, uniform, progression opportunities.",
    shiftInfo: "Day/evening rota including weekends",
    jobType: JobType.WEEKEND,
  },
  {
    title: "Cleaner",
    category: "Cleaner",
    salary: "£11.50/hr",
    description: "Maintain hygiene standards in student accommodation blocks.",
    responsibilities: "Clean common areas, replenish supplies, report maintenance issues.",
    requirements: "Consistency, physical stamina, trustworthiness.",
    benefits: "Morning shifts, stable rota.",
    shiftInfo: "Early morning part-time",
    jobType: JobType.PART_TIME,
  },
  {
    title: "Café Assistant",
    category: "Café Assistant",
    salary: "£11.80/hr + tips",
    description: "Serve coffee and food near campus with flexible student shifts.",
    responsibilities: "Coffee prep, till handling, table clearing, customer service.",
    requirements: "Friendly and quick learner, ability to multitask.",
    benefits: "Free drinks and discounted food.",
    shiftInfo: "Morning and lunch peaks",
    jobType: JobType.PART_TIME,
  },
  {
    title: "Delivery Driver",
    category: "Delivery Driver",
    salary: "£13.25/hr",
    description: "Local multi-drop deliveries with route support and paid mileage.",
    responsibilities: "Load van, deliver parcels, capture proof of delivery, keep schedule.",
    requirements: "Valid UK driving licence, basic smartphone use.",
    benefits: "Mileage paid weekly.",
    shiftInfo: "Day and weekend runs",
    jobType: JobType.FULL_TIME,
  },
];

const places = ["Manchester City Centre", "Salford", "Stockport", "Trafford Centre", "Deansgate", "Oxford Road", "Didsbury", "Chorlton"];

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.jobSeekerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const employers: { userId: string; companyId: string }[] = [];

  for (const entry of companies) {
    const user = await prisma.user.create({
      data: {
        email: entry.user.email,
        fullName: entry.user.fullName,
        passwordHash,
        role: "EMPLOYER",
        employerProfile: {
          create: {
            contactEmail: entry.user.email,
            hiringPreferences: "Prioritise student-friendly flexibility and quick starts.",
            company: {
              create: {
                ...entry.company,
                contactEmail: entry.user.email,
                website: "https://example.local",
              },
            },
          },
        },
      },
      include: {
        employerProfile: { include: { company: true } },
      },
    });

    employers.push({
      userId: user.id,
      companyId: user.employerProfile!.company!.id,
    });
  }

  const seekers: { id: string }[] = [];

  for (const seeker of seekerUsers) {
    const user = await prisma.user.create({
      data: {
        email: seeker.email,
        fullName: seeker.fullName,
        passwordHash,
        role: "SEEKER",
        seekerProfile: {
          create: {
            location: seeker.location,
            preferredRoles: seeker.preferredRoles,
            availability: "Weekday evenings and weekends",
            workEligibility: "Eligible to work in UK",
            bio: "Reliable and friendly worker looking for flexible local shifts.",
          },
        },
      },
    });

    seekers.push({ id: user.id });
  }

  const createdJobs = [] as { id: string; employerId: string }[];

  for (let i = 0; i < 45; i += 1) {
    const employer = employers[i % employers.length];
    const template = templates[i % templates.length];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (i % 20));

    const job = await prisma.job.create({
      data: {
        employerId: employer.userId,
        companyId: employer.companyId,
        title: `${template.title}${i % 5 === 0 ? " (Immediate Start)" : ""}`,
        location: places[i % places.length],
        category: template.category,
        jobType: template.jobType,
        salary: template.salary,
        workMode: "ONSITE",
        shiftInfo: template.shiftInfo,
        description: template.description,
        responsibilities: template.responsibilities,
        requirements: template.requirements,
        benefits: template.benefits,
        vacancies: 1 + (i % 4),
        studentFriendly: i % 6 !== 0,
        immediateStart: i % 4 === 0,
        urgentHiring: i % 7 === 0,
        status: i % 11 === 0 ? "DRAFT" : "PUBLISHED",
        createdAt,
      },
    });

    createdJobs.push({ id: job.id, employerId: employer.userId });
  }

  const openJobs = await prisma.job.findMany({ where: { status: "PUBLISHED" }, take: 14 });

  for (let i = 0; i < openJobs.length; i += 1) {
    const seeker = seekers[i % seekers.length];
    const app = await prisma.application.create({
      data: {
        jobId: openJobs[i].id,
        seekerId: seeker.id,
        cvFileId: await createMockCv(seeker.id, i),
        note: "Hi, I am available immediately and would love to be considered for this role.",
        status: [
          ApplicationStatus.SUBMITTED,
          ApplicationStatus.REVIEWED,
          ApplicationStatus.SHORTLISTED,
          ApplicationStatus.REJECTED,
          ApplicationStatus.HIRED,
        ][i % 5],
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        applicationId: app.id,
        jobId: app.jobId,
        employerId: openJobs[i].employerId,
        seekerId: seeker.id,
      },
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: seeker.id,
          body: "Hi, thanks for posting this role. I have just applied.",
        },
        {
          conversationId: conversation.id,
          senderId: openJobs[i].employerId,
          body: "Thanks for applying. Can you confirm your weekend availability?",
        },
      ],
    });
  }

  console.log("Seed complete: employers, seekers, jobs, applications, conversations created.");
}

async function createMockCv(ownerId: string, index: number) {
  const file = await prisma.uploadedFile.create({
    data: {
      ownerId,
      type: "CV",
      originalName: `sample-cv-${index + 1}.pdf`,
      storedName: `sample-cv-${index + 1}.pdf`,
      mimeType: "application/pdf",
      size: 1024 + index,
      path: "/uploads/cv/sample-cv.pdf",
    },
  });

  await prisma.jobSeekerProfile.updateMany({
    where: { userId: ownerId },
    data: { cvFileId: file.id },
  });

  return file.id;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
