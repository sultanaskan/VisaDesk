import crypto from "crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

function credentialKey() {
  const value = process.env.BOOKING_CREDENTIAL_KEY || "";
  return /^[a-f\d]{64}$/i.test(value) ? Buffer.from(value, "hex") : null;
}

function encryptBookingDetails(details = {}) {
  const copy = { ...details };
  for (const [field, value] of Object.entries(copy)) {
    if (!/password|passcode|secret/i.test(field) || !value) continue;
    const key = credentialKey();
    if (!key) throw new HttpError(503, "BOOKING_CREDENTIAL_KEY is missing or invalid. Set a 64-character hexadecimal key in the app environment or project .env file, then restart the application.");
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
    copy[field] = `enc:v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${ciphertext.toString("base64url")}`;
  }
  return copy;
}

function decryptBookingDetails(details = {}) {
  const copy = { ...details };
  for (const [field, value] of Object.entries(copy)) {
    if (!/password|passcode|secret/i.test(field) || typeof value !== "string" || !value.startsWith("enc:v1:")) continue;
    const key = credentialKey();
    if (!key) throw new HttpError(503, "Secure booking credential key is not configured.");
    const [, , ivText, tagText, ciphertextText] = value.split(":");
    try {
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivText, "base64url"));
      decipher.setAuthTag(Buffer.from(tagText, "base64url"));
      copy[field] = Buffer.concat([decipher.update(Buffer.from(ciphertextText, "base64url")), decipher.final()]).toString("utf8");
    } catch {
      throw new HttpError(500, "Unable to decrypt a stored booking credential. Check the configured credential key.");
    }
  }
  return copy;
}

function redactBookingDetails(details = {}) {
  return Object.fromEntries(Object.entries(details).filter(([key]) => !/password|passcode|secret/i.test(key)));
}
function withoutBookingCredentials(application) {
  return { ...application, bookingDetails: redactBookingDetails(application.bookingDetails || {}) };
}

export async function createApplication(req, res) {
  const { credentialConsent, ...data } = req.validated.body;
  const requiredBySite = {
    IVAC: ["loginEmail", "loginPhone", "loginPassword", "webfileNumber", "dateOfBirth", "nationalId", "ivacCenter"],
    UK_VFS: ["loginEmail", "loginPhone", "loginPassword", "applicationReference", "dateOfBirth", "passportExpiry", "vfsCenter"],
    VFS_GLOBAL: ["loginEmail", "loginPhone", "loginPassword", "applicationReference", "dateOfBirth", "passportExpiry", "vfsCenter"],
    US_VISA_SCHEDULING: ["loginEmail", "loginPhone", "loginPassword", "visaClass", "ds160Confirmation", "dateOfBirth", "passportExpiry", "nationality", "interviewLocation"]
  };
  const missingBookingFields = (requiredBySite[data.bookingSite] || [])
    .filter((key) => !String(data.bookingDetails?.[key] ?? "").trim());
  if (missingBookingFields.length) {
    throw new HttpError(400, `Complete the required ${data.bookingSite} slot booking fields: ${missingBookingFields.join(", ")}.`);
  }
  if (requiredBySite[data.bookingSite] && credentialConsent !== "yes") {
    throw new HttpError(400, "Confirm the applicant's authorization before submitting booking-site login details.");
  }
  if (data.bookingSite === "IVAC" && (!data.applicantPhone || !data.applicantEmail)) {
    throw new HttpError(400, "IVAC slot requests require the applicant's mobile number and email address.");
  }
  if (data.bookingSite === "IVAC" && !req.files?.some((file) => file.mimetype === "application/pdf")) {
    throw new HttpError(400, "Upload the original Primary Webfile PDF for an IVAC slot request.");
  }
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
      ...data, bookingDetails: encryptBookingDetails(data.bookingDetails), referenceCode, userId: req.user.id,
      documents: req.files?.length ? {
        create: req.files.map((file) => ({
          originalName: file.originalname, storedName: file.filename,
          mimeType: file.mimetype, sizeBytes: file.size
        }))
      } : undefined
    },
    include: { documents: true, fromCountry: true, toCountry: true, category: true, center: true }
  });
  res.status(201).json({ success: true, message: "Slot booking request saved as draft.", data: withoutBookingCredentials(application) });
}

export async function myApplications(req, res) {
  const applications = await prisma.application.findMany({
    where: { userId: req.user.id },
    include: { documents: true, fromCountry: true, toCountry: true, category: true, center: true, priorityRequests: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: applications.map(withoutBookingCredentials) });
}

export async function getApplication(req, res) {
  const application = await prisma.application.findFirst({
    where: { id: Number(req.params.id), userId: req.user.id },
    include: { documents: true, fromCountry: true, toCountry: true, category: true, center: true, priorityRequests: true }
  });
  if (!application) throw new HttpError(404, "Application not found.");
  res.json({ success: true, data: withoutBookingCredentials(application) });
}

export async function adminGetApplication(req, res) {
  const application = await prisma.application.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      documents: true, fromCountry: true, toCountry: true, category: true, center: true,
      priorityRequests: { orderBy: { createdAt: "desc" } }
    }
  });
  if (!application) throw new HttpError(404, "Slot booking request not found.");
  res.json({ success: true, data: { ...application, bookingDetails: decryptBookingDetails(application.bookingDetails || {}) } });
}

export async function downloadApplicationDocument(req, res) {
  const applicationId = Number(req.params.id);
  const documentId = Number(req.params.documentId);
  const document = await prisma.applicationDocument.findFirst({
    where: {
      id: documentId,
      applicationId,
      application: req.user.role === "ADMIN" ? undefined : { userId: req.user.id }
    }
  });
  if (!document) throw new HttpError(404, "Booking document not found.");
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
  const filePath = path.join(uploadDir, path.basename(document.storedName));
  try { await fs.access(filePath); } catch { throw new HttpError(404, "The uploaded file is no longer available."); }
  res.download(filePath, document.originalName);
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
  res.json({ success: true, data: applications.map(withoutBookingCredentials) });
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
