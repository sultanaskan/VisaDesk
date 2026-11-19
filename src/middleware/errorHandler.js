import { ZodError } from "zod";

export function notFound(req, res) {
  res.status(404).json({ success: false, message: "API endpoint not found." });
}

export function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
    });
  }
  const status = error.statusCode || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error." : error.message
  });
}
