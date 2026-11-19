import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

export async function createApplication(req, res) {
  const data = req.validated.body;
  const [fromCountry, toCountry, category, center] = await Promise.all([
    prisma.country.findFirst({ where: { id: data.fromCountryId, isActive: true } }),
    prisma.country.findFirst({ where: { id: data.toCountryId, isActive: true } }),
    prisma.visaCategory.findFirst({ where: { id: data.categoryId, isActive: true } }),
    prisma.visaCenter.findFirst({ where: { id: data.centerId, isActive: true } })
  ]);
  if (!fromCountry || !toCountry || !category || !center || center.countryId !== fromCountry.id) {
    throw new HttpError(400, "Select active from/to countries, a visa category, and an application center located in the from country.");
  }
  const referenceCode = `VSA-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const application = await prisma.application.create({
    data: {
      ...data, referenceCode, userId: req.user.id,
      documents: req.files?.length ? {
        create: req.files.map((file) => ({
          originalName: file.originalname, storedName: file.filename,
          mimeType: file.mimetype, sizeBytes: file.size
        }))
      } : undefined
    },
    include: { documents: true, fromCountry: true, toCountry: true, category: true, center: true }
  });
  res.status(201).json({ success: true, message: "Application saved as draft.", data: application });
}

export async function myApplications(req, res) {
  const applications = await prisma.application.findMany({
    where: { userId: req.user.id },
    include: { documents: true, fromCountry: true, toCountry: true, category: true, center: true, priorityRequests: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: applications });
}

export async function getApplication(req, res) {
  const application = await prisma.application.findFirst({
    where: { id: Number(req.params.id), userId: req.user.id },
    include: { documents: true, fromCountry: true, toCountry: true, category: true, center: true, priorityRequests: true }
  });
  if (!application) throw new HttpError(404, "Application not found.");
  res.json({ success: true, data: application });
}

export async function adminApplications(req, res) {
  const applications = await prisma.application.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      documents: true, fromCountry: true, toCountry: true, category: true, center: true,
      priorityRequests: { orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: applications });
}

export async function updateApplicationStatus(req, res) {
  const allowed = ["SUBMITTED", "IN_REVIEW", "PROCESSING", "COMPLETED", "REJECTED"];
  const status = req.body.status;
  if (!allowed.includes(status)) throw new HttpError(400, "Invalid application status.");
  const application = await prisma.application.update({
    where: { id: Number(req.params.id) }, data: { status }
  });
  res.json({ success: true, data: application });
}
