import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { applicationSchema } from "../validators/schemas.js";
import {
  createApplication, myApplications, getApplication, adminApplications, updateApplicationStatus
} from "../controllers/application.controller.js";
import { requestPriority } from "../controllers/priority.controller.js";
import { prioritySchema } from "../validators/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(authenticate);
router.post("/", upload.array("documents", 10), validate(applicationSchema), asyncHandler(createApplication));
router.get("/mine", asyncHandler(myApplications));
router.get("/admin/all", authorize("ADMIN"), asyncHandler(adminApplications));
router.patch("/admin/:id/status", authorize("ADMIN"), asyncHandler(updateApplicationStatus));
router.get("/:id", asyncHandler(getApplication));
router.post("/:id/priority", validate(prioritySchema), asyncHandler(requestPriority));
export default router;
