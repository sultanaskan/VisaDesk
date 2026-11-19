import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import priorityRoutes from "./routes/priority.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
app.use(helmet());
const configuredOrigins = process.env.CLIENT_ORIGIN?.trim();
const corsOptions = {
  origin: configuredOrigins === "*"
    ? "*"
    : configuredOrigins
      ? configuredOrigins.split(",").map(origin => origin.trim())
      : true,

  credentials: configuredOrigins === "*" ? false : true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/api/v1/health", (req, res) => res.json({ success: true, message: "Visa Agency API is running." }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/priorities", priorityRoutes);
app.use("/api/v1/catalog", catalogRoutes);

// Serve both role-based workspaces from the API origin for a single deployment.
app.use("/admin", express.static(path.join(projectRoot, "visa-slot-admin-portal"), { index: "index.html", fallthrough: true, maxAge: "1h" }));
app.get("/admin", (req, res) => res.sendFile(path.join(projectRoot, "visa-slot-admin-portal", "index.html")));
app.get("/admin/*", (req, res, next) => {
  if (path.extname(req.path)) return next();
  res.sendFile(path.join(projectRoot, "visa-slot-admin-portal", "index.html"));
});
app.use(express.static(path.join(projectRoot, "client-portal"), { index: "index.html", fallthrough: true, maxAge: "1h" }));

app.use(notFound);
app.use(errorHandler);
export default app;
