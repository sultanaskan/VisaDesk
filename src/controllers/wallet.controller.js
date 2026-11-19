import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

export async function createDeposit(req, res) {
  const { amount, paymentMethod, senderAccount, transactionRef } = req.validated.body;
  const proofPath = req.file ? req.file.path : null;
  const deposit = await prisma.deposit.create({
    data: { userId: req.user.id, amount: amount.toFixed(2), paymentMethod, senderAccount, transactionRef, proofPath }
  });
  res.status(201).json({ success: true, message: "Deposit request submitted for admin review.", data: deposit });
}

export async function walletSummary(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { walletBalance: true, walletReserved: true }
  });
  res.json({ success: true, data: user });
}

export async function ledger(req, res) {
  const entries = await prisma.walletLedger.findMany({
    where: { userId: req.user.id }, orderBy: { createdAt: "desc" }, take: 100
  });
  res.json({ success: true, data: entries });
}

export async function adminDeposits(req, res) {
  const status = req.query.status;
  const deposits = await prisma.deposit.findMany({
    where: status ? { status } : {},
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: deposits });
}

export async function reviewDeposit(req, res) {
  const { decision, adminNote } = req.validated.body;
  const depositId = Number(req.params.id);

  const result = await prisma.$transaction(async (tx) => {
    const deposit = await tx.deposit.findUnique({ where: { id: depositId } });
    if (!deposit) throw new HttpError(404, "Deposit request not found.");
    if (deposit.status !== "PENDING") throw new HttpError(409, "This deposit has already been reviewed.");

    const updated = await tx.deposit.update({
      where: { id: depositId },
      data: {
        status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
        adminNote, reviewedById: req.user.id, reviewedAt: new Date()
      }
    });

    if (decision === "APPROVE") {
      const user = await tx.user.update({
        where: { id: deposit.userId },
        data: { walletBalance: { increment: deposit.amount } }
      });
      await tx.walletLedger.create({
        data: {
          userId: deposit.userId, type: "DEPOSIT", amount: deposit.amount,
          balanceAfter: user.walletBalance, referenceType: "DEPOSIT",
          referenceId: deposit.id, description: `Deposit approved: ${deposit.transactionRef}`
        }
      });
    }
    return updated;
  });
  res.json({ success: true, message: `Deposit ${decision.toLowerCase()}d.`, data: result });
}
