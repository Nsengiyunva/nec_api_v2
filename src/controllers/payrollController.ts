import { Request, Response } from "express";
import { AuthRequest } from '../middleware/authMiddleware'
import { createReadStream, existsSync, statSync } from 'fs';
import { basename } from 'path';

import { models } from "../models";
import { sequelize } from "../config/database";
import {
  PAYROLL_STAGES, VISIBILITY_OPEN_STAGE, OPEN_STATUSES, effectiveStage, normalizeRole,
  HRM_FIRST_PAYROLL_MONTH, LEGACY_STAGE1_REVIEWER,
} from "../config/payrollWorkflow";
const { Payroll, PayrollComment, Admin, PayrollStatusHistory } = models;

const COMMENT_USER_ATTRIBUTES = ["id", "firstName", "lastName", "role", "user_type"];

// Shared include: comments (oldest first) with their author, plus the uploader.
const PAYROLL_INCLUDE = [
  {
    model: PayrollComment,
    as: "comments",
    separate: true, // own query so ORDER BY applies cleanly per payroll
    order: [["createdAt", "ASC"], ["id", "ASC"]] as any,
    include: [{ model: Admin, as: "user", attributes: COMMENT_USER_ATTRIBUTES }],
  },
  { model: Admin, as: "uploader", attributes: COMMENT_USER_ATTRIBUTES, required: false },
];

function isSoftDeleted(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return false;
  const s = String(v);
  if (s.startsWith("0000-00-00")) return false;
  const d = new Date(v as any);
  return !isNaN(d.getTime()) && d.getFullYear() > 1970;
}

function fullName(u: any): string {
  return [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() || u?.name || "";
}

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

// "August 2024" -> 2024*12 + 7. Unparseable strings sort to the very
// bottom (Number.NEGATIVE_INFINITY) instead of throwing or landing
// in an arbitrary spot.
function monthSortKey(month: unknown): number {
  const str = String(month || "").trim().toLowerCase();
  const match = str.match(/^([a-z]+)\s+(\d{4})$/);
  if (!match) return Number.NEGATIVE_INFINITY;

  const monthIndex = MONTH_NAMES.indexOf(match[1]);
  if (monthIndex === -1) return Number.NEGATIVE_INFINITY;

  const year = parseInt(match[2], 10);
  return year * 12 + monthIndex;
}

// Resolve who each comment should be displayed as. Uses the snapshot
// (actorName/actorRole) when present, else the live user row — then, for
// payrolls BEFORE the HRM era, any HRM/HR/AUDITOR-labelled comment is
// shown as the CIA (Edson Oyera), since the HRM role didn't exist yet.
function applyCommentAttribution(payroll: any) {
  const isPreHrm = monthSortKey(payroll?.month) < monthSortKey(HRM_FIRST_PAYROLL_MONTH);
  const comments: any[] = payroll?.comments || [];
  for (const c of comments) {
    const u = c.user || {};
    let name = (c.actorName && String(c.actorName).trim()) || fullName(u);
    let role = normalizeRole(c.actorRole || u.user_type || u.role);

    if (isPreHrm && (role === "HRM" || role === "AUDITOR" || role === "CIA")) {
      name = LEGACY_STAGE1_REVIEWER.name;
      role = LEGACY_STAGE1_REVIEWER.role;
    }

    if (typeof c.setDataValue === "function") {
      c.setDataValue("actorName", name);
      c.setDataValue("actorRole", role);
    } else {
      c.actorName = name;
      c.actorRole = role;
    }
  }
  return payroll;
}

// ===============================
// Upload Payroll (Accountant only)
// ===============================
export const uploadPayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { month } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "File required" });

    const requester = await Admin.findByPk(req.user?.id);
    if (!requester || requester.user_type !== "ACCOUNTANT") {
      return res.status(403).json({ message: "Only the Accountant can upload payrolls." });
    }

    // Stage 0 = with Accountant, not yet submitted. The follow-up
    // POST /:id/action with decision "submit" moves it to stage 1 and
    // sets status to PENDING APPROVAL.
    const payroll = await Payroll.create({
      month,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size.toString(),
      uploadedBy: req.user?.id || null,
      status: "DRAFT",
      stage: 0,
    });

    res.status(201).json(payroll);
  } catch (error) {
    console.error("Payroll upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ===============================
// Get All Payrolls (visibility-filtered per the workflow rules)
// ===============================
export const getPayrolls = async (req: AuthRequest, res: Response) => {
  try {
    const requester = await Admin.findByPk(req.user?.id);
    if (!requester) {
      return res.status(401).json({ message: "Invalid user" });
    }

    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "10"), 10) || 10));
    const search = String(req.query.search ?? "").trim().toLowerCase();
    const status = String(req.query.status ?? "").trim();

    // Soft-delete is checked in JS, not SQL: legacy rows can carry a
    // MySQL zero-date ('0000-00-00 00:00:00') in deletedAt, which is
    // NOT NULL (so `WHERE deletedAt IS NULL` silently dropped them) but
    // is not a real deletion either.
    const allRows = await Payroll.findAll({ include: PAYROLL_INCLUDE as any });
    const payrolls = allRows.filter((p: any) => !isSoftDeleted(p.deletedAt));

    // Legacy rows may have a NULL/non-numeric stage — derive one from the
    // status so they're filtered, displayed and actioned consistently.
    for (const p of payrolls as any[]) {
      const eff = effectiveStage(p);
      if (p.stage !== eff) p.setDataValue("stage", eff);
    }

    // Visibility (per the agreed requirement: "allow all users to view
    // all approved, paid, pending approval"): every submitted payroll is
    // visible to every signed-in user. Only an un-submitted DRAFT is
    // private — visible to ICT, Accountants and whoever uploaded it.
    // The old per-stage/per-commenter rule hid most records from most
    // roles, which is why the list showed fewer payrolls than the DB.
    const isIct = requester.user_type === "ICT";
    const myRole = normalizeRole(requester.user_type);
    let visible = payrolls.filter((p: any) => {
      const isDraft = String(p.status || "").trim().toUpperCase() === "DRAFT";
      if (!isDraft) return true;
      return isIct || myRole === "ACCOUNTANT" || String(p.uploadedBy) === String(requester.id);
    });

    if (search) {
      visible = visible.filter(
        (p: any) =>
          String(p.month || "").toLowerCase().includes(search) ||
          String(p.fileName || "").toLowerCase().includes(search)
      );
    }

    if (status && status !== "All") {
      const wanted = status.toUpperCase();
      visible = visible.filter((p: any) => String(p.status || "").trim().toUpperCase() === wanted);
    }

    // Sort by the payroll's own period ("July 2026"), not upload date —
    // parsed in JS rather than via MySQL's STR_TO_DATE, which turned out
    // to not sort as expected (likely a server locale/collation quirk).
    // Unparseable month strings sort to the very end instead of erroring.
    visible.sort((a: any, b: any) => monthSortKey(b.month) - monthSortKey(a.month));

    // Visibility depends on per-user role/comment history, so it can't
    // be pushed into the SQL WHERE clause without duplicating the
    // workflow rules there — pagination is applied after filtering
    // in-memory instead. Fine at current volumes; if the table grows
    // into the tens of thousands, move the visibility check into SQL.
    const total = visible.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paged = visible.slice(start, start + pageSize);

    paged.forEach(applyCommentAttribution);

    // ICT-only reconciliation numbers, to compare against the DB directly.
    const counts = isIct
      ? { inTable: allRows.length, softDeleted: allRows.length - payrolls.length, active: payrolls.length, matchingFilters: total }
      : undefined;

    res.json({ data: paged, page, pageSize, total, totalPages, counts });
  } catch (error) {
    console.error("getPayrolls error:", error);
    res.status(500).json({ message: "Failed to fetch payrolls" });
  }
};


// ===============================
// Download Payroll File
// ===============================
export const downloadPayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    const filePath: string = payroll.filePath;
    if (!filePath) {
      return res.status(404).json({ message: "No file attached to this payroll" });
    }

    // filePath from multer is already an absolute OS path
    const absolutePath = filePath.startsWith('/')
      ? filePath
      : `${process.cwd()}/${filePath}`;

    if (!existsSync(absolutePath)) {
      console.error(`[downloadPayroll] File missing on disk: ${absolutePath}`);
      return res.status(404).json({
        message: "File no longer exists on the server. It may have been moved or deleted."
      });
    }

    const stat     = statSync(absolutePath);
    const fileName = payroll.fileName || basename(absolutePath);
    const ext      = fileName.split('.').pop()?.toLowerCase() ?? '';

    const mimeTypes: Record<string, string> = {
      pdf:  'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls:  'application/vnd.ms-excel',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc:  'application/msword',
      csv:  'text/csv',
    };

    res.set({
      'Content-Type':        mimeTypes[ext] ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length':      stat.size,
      'Cache-Control':       'no-store',
    });

    const stream = createReadStream(absolutePath);

    stream.on('error', (err) => {
      console.error('[downloadPayroll] Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to read file from disk' });
      }
    });

    stream.pipe(res);

  } catch (error) {
    console.error('[downloadPayroll] Unexpected error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Download failed" });
    }
  }
};


// ===============================
// Action a payroll: comment + decision, moving it through the
// approval workflow per PAYROLL_STAGES. Replaces the old separate
// addComment / approvePayroll / rejectPayroll / updatePayrollStage
// endpoints with a single rules-engine-driven one.
// ===============================
export const actionPayroll = async (req: AuthRequest, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { comment, decision } = req.body;

    const payroll = await Payroll.findByPk(id, { transaction });
    if (!payroll || isSoftDeleted(payroll.deletedAt)) {
      await transaction.rollback();
      return res.status(404).json({ message: "Payroll not found" });
    }

    const currentStage = effectiveStage(payroll);
    const stageRule = PAYROLL_STAGES[currentStage];
    if (!stageRule) {
      await transaction.rollback();
      return res.status(400).json({ message: "This payroll has already completed its workflow." });
    }

    const requester = await Admin.findByPk(req.user?.id, { transaction });
    if (!requester) {
      await transaction.rollback();
      return res.status(401).json({ message: "Invalid user" });
    }

    if (normalizeRole(requester.user_type) !== stageRule.ownerRole) {
      await transaction.rollback();
      return res.status(403).json({ message: "It is not your turn to act on this payroll." });
    }

    const chosenDecision = decision || Object.keys(stageRule.decisions)[0];
    const transition = stageRule.decisions[chosenDecision];
    if (!transition) {
      await transaction.rollback();
      return res.status(400).json({ message: "That action isn't available at this stage." });
    }

    if (stageRule.commentRequired && (!comment || !String(comment).trim())) {
      await transaction.rollback();
      return res.status(400).json({ message: "A remark is required for this action." });
    }

    // One action per user per stage on a given payroll.
    const alreadyActed = await PayrollComment.findOne({
      where: { payrollId: payroll.id, userId: requester.id, stage: currentStage },
      transaction,
    });
    if (alreadyActed) {
      await transaction.rollback();
      return res.status(403).json({ message: "You have already actioned this payroll at this stage." });
    }

    if (comment && String(comment).trim()) {
      await PayrollComment.create(
        {
          payrollId: payroll.id,
          userId: requester.id,
          comment: String(comment).trim(),
          stage: currentStage,
          actorName: fullName(requester),
          actorRole: normalizeRole(requester.user_type),
        },
        { transaction }
      );
    } else {
      // No remark given (only possible where commentRequired is false,
      // e.g. MD approve/reject) — still leave a trail entry so the
      // action is visible, using the decision's default label.
      await PayrollComment.create(
        {
          payrollId: payroll.id,
          userId: requester.id,
          comment: transition.label,
          stage: currentStage,
          actorName: fullName(requester),
          actorRole: normalizeRole(requester.user_type),
        },
        { transaction }
      );
    }

    const oldStatus = payroll.status;

    payroll.stage = transition.nextStage;
    payroll.status = transition.status;
    await payroll.save({ transaction });

    if (oldStatus !== transition.status) {
      await PayrollStatusHistory.create(
        {
          payrollId: payroll.id,
          oldStatus,
          newStatus: transition.status,
          changedBy: requester.id,
        },
        { transaction }
      );
    }

    await transaction.commit();

    const updated = await Payroll.findByPk(payroll.id, { include: PAYROLL_INCLUDE as any });

    if (updated) applyCommentAttribution(updated);

    res.json({ success: true, message: "Payroll updated", payroll: updated });
  } catch (error) {
    await transaction.rollback();
    console.error("actionPayroll error:", error);
    res.status(500).json({ message: "Failed to action payroll" });
  }
};


// ===============================
// Soft-delete Payroll (ICT only)
// ===============================
export const deletePayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const requester = await Admin.findByPk(req.user?.id);
    if (!requester || requester.user_type !== "ICT") {
      return res.status(403).json({ message: "Only ICT staff can delete payroll records." });
    }

    const payroll = await Payroll.findByPk(id);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    if (isSoftDeleted(payroll.deletedAt)) {
      return res.status(400).json({ message: "Payroll is already deleted" });
    }

    payroll.deletedAt = new Date();
    await payroll.save();

    res.json({ success: true, message: "Payroll deleted" });
  } catch (error) {
    console.error("deletePayroll error:", error);
    res.status(500).json({ message: "Failed to delete payroll" });
  }
};