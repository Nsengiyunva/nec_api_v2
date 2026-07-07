// import { Request, Response } from "express";
// import { AuthRequest } from '../middleware/authMiddleware'

// import { models } from "../models";
// import { sequelize } from "../config/database";
// const { Payroll, PayrollComment, Admin,PayrollStatusHistory } = models;

// export const uploadPayroll = async (req: AuthRequest, res: Response) => {
//   try {
//     const { month, stage } = req.body;
//     const file = req.file;

//     if (!file) return res.status(400).json({ message: "File required" });

//     const payroll = await Payroll.create({
//       month,
//       fileName: file.originalname,
//       filePath: file.path,
//       fileSize: file.size.toString(),
//       uploadedBy: req.user?.id || null, // null if not logged in
//       status: "PENDING APPRROVAL",
//       stage: stage
//     });

//     res.status(201).json(payroll);
//   } catch (error) {
//     console.error("Payroll upload error:", error);
//     res.status(500).json({ message: "Upload failed" });
//   }
// };


// // ===============================
// // Get All Payrolls
// // ===============================
// export const getPayrolls = async (req: Request, res: Response) => {
//   try {
//     const payrolls = await Payroll.findAll({
//       include: [
//         {
//           model: PayrollComment,
//           as: "comments",
//           include: [
//             {
//               model: Admin,
//               as: "user",
//               attributes: ["id", "firstName", "lastName", "role"],
//             },
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json(payrolls);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch payrolls" });
//   }
// };


// // ===============================
// // Add Comment (Moves to UNDER_REVIEW if PENDING)
// // ===============================
// export const addComment = async (req: AuthRequest, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { comment } = req.body;

//     const payroll = await Payroll.findByPk(id);
//     if (!payroll) return res.status(404).json({ message: "Not found" });

//     if (payroll.status === "PAID") {
//       return res.status(400).json({ message: "Cannot comment on paid payroll" });
//     }

//     const newComment = await PayrollComment.create({
//       payrollId: Number(id),
//       userId: (req as any).user.id,
//       comment,
//     });

   
//     if (payroll.status === "PENDING APPROVAL") {
//       await PayrollStatusHistory.create({
//         payrollId: payroll.id,
//         oldStatus: payroll.status,
//         newStatus: "PENDING APPROVAL",
//         changedBy: (req as any).user.id,
//       });

//       payroll.status = "PENDING APPROVAL";
//       await payroll.save();
//     }

//     const fullComment = await PayrollComment.findByPk(newComment.id, {
//       include: [
//         {
//           model: Admin,
//           as: "user",
//           attributes: ["id", "firstName", "lastName", "role"],
//         },
//       ],
//     });

//     res.status(201).json(fullComment);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to add comment" });
//   }
// }

// // ===============================
// // Approve Payroll
// // ===============================
// export const approvePayroll = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const payroll = await Payroll.findByPk(id);
//     if (!payroll) return res.status(404).json({ message: "Not found" });

//     if (!(payroll.status == "APPROVED" || payroll.status == "PAID" ) ) {
//       return res.status(400).json({ message: "Payroll must be under review" });
//     }

//     if ((req as any).user.role !== "FINANCE") {
//       return res.status(403).json({ message: "Only Finance can approve" });
//     }

//     await PayrollStatusHistory.create({
//       payrollId: payroll.id,
//       oldStatus: payroll.status,
//       newStatus: "APPROVED",
//       changedBy: (req as any).user.id,
//     });

//     payroll.status = "APPROVED";
//     await payroll.save();

//     res.json({ message: "Payroll approved", payroll });
//   } catch (error) {
//     res.status(500).json({ message: "Approval failed" });
//   }
// };


// // ===============================
// // Reject Payroll
// // ===============================
// export const rejectPayroll = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { reason } = req.body;

//     const payroll = await Payroll.findByPk(id);
//     if (!payroll) return res.status(404).json({ message: "Not found" });

//     if (payroll.status !== "UNDER_REVIEW") {
//       return res.status(400).json({ message: "Payroll must be under review" });
//     }

//     await PayrollComment.create({
//       payrollId: payroll.id,
//       userId: (req as any).user.id,
//       comment: `REJECTION: ${reason}`,
//     });

//     await PayrollStatusHistory.create({
//       payrollId: payroll.id,
//       oldStatus: payroll.status,
//       newStatus: "REJECTED",
//       changedBy: (req as any).user.id,
//     });

//     payroll.status = "REJECTED";
//     await payroll.save();

//     res.json({ message: "Payroll rejected", payroll });
//   } catch (error) {
//     res.status(500).json({ message: "Rejection failed" });
//   }
// }

// export const updatePayrollStage = async (req: Request, res: Response) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const payrollId = req.params.id;
//     const { comment, stage, status } = req.body;

//     const userId = (req as any).user?.id; // from auth middleware

//     const payroll = await Payroll.findByPk(payrollId, { transaction });

//     if (!payroll) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "Payroll not found" });
//     }

//     const oldStatus = payroll.status;

//     /*
//     ----------------------------
//     1. Insert Comment
//     ----------------------------
//     */
//     if (comment) {
//       await PayrollComment.create(
//         {
//           payrollId: payroll.id,
//           userId: userId,
//           comment: comment,
//         },
//         { transaction }
//       );
//     }

//     /*
//     ----------------------------
//     2. Update Payroll
//     ----------------------------
//     */
//     if (stage > 1) {
//       await payroll.update(
//         {
//           stage: stage,
//           status: status ?? payroll.status,
//         },
//         { transaction }
//       );
//     }

//     /*
//     ----------------------------
//     3. Store Status History
//     ----------------------------
//     */
//     if (status && oldStatus !== status) {
//       await PayrollStatusHistory.create(
//         {
//           payrollId: payroll.id,
//           oldStatus: oldStatus,
//           newStatus: status,
//           changedBy: userId,
//         },
//         { transaction }
//       );
//     }

//     await transaction.commit();

//     return res.json({
//       success: true,
//       message: "Payroll updated successfully",
//     });

//   } catch (error) {

//     await transaction.rollback();

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update payroll",
//       error,
//     });

//   }
// };

import { Request, Response } from "express";
import { AuthRequest } from '../middleware/authMiddleware'
import { createReadStream, existsSync, statSync } from 'fs';
import { basename } from 'path';

import { models } from "../models";
import { sequelize } from "../config/database";
import { PAYROLL_STAGES, VISIBILITY_OPEN_STAGE } from "../config/payrollWorkflow";
const { Payroll, PayrollComment, Admin, PayrollStatusHistory } = models;

const COMMENT_USER_ATTRIBUTES = ["id", "firstName", "lastName", "role", "user_type"];

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

    const payrolls = await Payroll.findAll({
      where: { deletedAt: null },
      include: [
        {
          model: PayrollComment,
          as: "comments",
          include: [
            {
              model: Admin,
              as: "user",
              attributes: COMMENT_USER_ATTRIBUTES,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Stage >= VISIBILITY_OPEN_STAGE (approved by MD through paid) is
    // visible to everyone. Below that, only the current stage owner
    // and anyone who has already acted on this specific payroll.
    const visible = payrolls.filter((p: any) => {
      if (p.stage >= VISIBILITY_OPEN_STAGE) return true;

      const ownerRole = PAYROLL_STAGES[p.stage]?.ownerRole;
      if (ownerRole && requester.user_type === ownerRole) return true;

      const comments = Array.isArray(p.comments) ? p.comments : [];
      return comments.some((c: any) => c.userId === requester.id);
    });

    res.json(visible);
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
    if (!payroll || payroll.deletedAt) {
      await transaction.rollback();
      return res.status(404).json({ message: "Payroll not found" });
    }

    const stageRule = PAYROLL_STAGES[payroll.stage];
    if (!stageRule) {
      await transaction.rollback();
      return res.status(400).json({ message: "This payroll has already completed its workflow." });
    }

    const requester = await Admin.findByPk(req.user?.id, { transaction });
    if (!requester) {
      await transaction.rollback();
      return res.status(401).json({ message: "Invalid user" });
    }

    if (requester.user_type !== stageRule.ownerRole) {
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
      where: { payrollId: payroll.id, userId: requester.id, stage: payroll.stage },
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
          stage: payroll.stage,
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

    const updated = await Payroll.findByPk(payroll.id, {
      include: [
        {
          model: PayrollComment,
          as: "comments",
          include: [{ model: Admin, as: "user", attributes: COMMENT_USER_ATTRIBUTES }],
        },
      ],
    });

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

    if (payroll.deletedAt) {
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
