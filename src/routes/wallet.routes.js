import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { depositSchema, reviewSchema } from "../validators/schemas.js";
import { createDeposit, walletSummary, ledger, adminDeposits, reviewDeposit } from "../controllers/wallet.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(authenticate);
router.get("/summary", asyncHandler(walletSummary));
router.get("/ledger", asyncHandler(ledger));
router.post("/deposits", upload.single("proof"), validate(depositSchema), asyncHandler(createDeposit));
router.get("/admin/deposits", authorize("ADMIN"), asyncHandler(adminDeposits));
router.patch("/admin/deposits/:id/review", authorize("ADMIN"), validate(reviewSchema), asyncHandler(reviewDeposit));
export default router;
