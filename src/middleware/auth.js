import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "Authentication token is required.");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    if (!user || user.status !== "ACTIVE") throw new HttpError(401, "Account is unavailable.");
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "Invalid or expired token."));
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new HttpError(403, "You do not have permission to perform this action."));
  }
  next();
};
