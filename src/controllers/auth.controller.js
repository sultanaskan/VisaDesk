import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

function tokenFor(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
}

export async function register(req, res) {
  const { name, email, phone, password, role } = req.validated.body;
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] }
  });
  if (existing) throw new HttpError(409, "Email or phone number is already registered.");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
  });
  res.status(201).json({ success: true, data: { user, token: tokenFor(user) } });
}

export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password.");
  }
  if (user.status !== "ACTIVE") throw new HttpError(403, "Your account is suspended.");
  res.json({
    success: true,
    data: {
      token: tokenFor(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }
  });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, status: true, walletBalance: true, walletReserved: true, createdAt: true }
  });
  res.json({ success: true, data: user });
}
