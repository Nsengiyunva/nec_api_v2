import { Request, Response } from "express";
import { Payroll } from "../models/payroll";
import { PayrollComment } from "../models/payroll_comment";
import { PayrollStatusHistory } from "../models/payroll_history";
import { Admin } from "../models/nec_user";


// ===============================
// Upload Payroll
// ===============================
export const uploadPayroll = async (req: Request, res: Response) => {
  try {
    const { month } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File required" });
    }

    const payroll = await Payroll.create({
      month,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size.toString(),
      uploadedBy: (req as any).user.id,
      status: "PENDING",
    });

    res.status(201).json(payroll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};


// ===============================
// Get All Payrolls
// ===============================
export const getPayrolls = async (req: Request, res: Response) => {
  try {
    const payrolls = await Payroll.findAll({
      include: [
        {
          model: PayrollComment,
          as: "comments",
          include: [
            {
              model: Admin,
              as: "user",
              attributes: ["id", "firstName", "lastName", "role"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payrolls" });
  }
};


// ===============================
// Add Comment (Moves to UNDER_REVIEW if PENDING)
// ===============================
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const payroll = await Payroll.findByPk(id);
    if (!payroll) return res.status(404).json({ message: "Not found" });

    if (payroll.status === "APPROVED") {
      return res.status(400).json({ message: "Cannot comment on approved payroll" });
    }

    const newComment = await PayrollComment.create({
      payrollId: Number(id),
      userId: (req as any).user.id,
      comment,
    });

    // Move PENDING → UNDER_REVIEW
    if (payroll.status === "PENDING") {
      await PayrollStatusHistory.create({
        payrollId: payroll.id,
        oldStatus: payroll.status,
        newStatus: "UNDER_REVIEW",
        changedBy: (req as any).user.id,
      });

      payroll.status = "UNDER_REVIEW";
      await payroll.save();
    }

    const fullComment = await PayrollComment.findByPk(newComment.id, {
      include: [
        {
          model: Admin,
          as: "user",
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
    });

    res.status(201).json(fullComment);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};


// ===============================
// Approve Payroll
// ===============================
export const approvePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByPk(id);
    if (!payroll) return res.status(404).json({ message: "Not found" });

    if (payroll.status !== "UNDER_REVIEW") {
      return res.status(400).json({ message: "Payroll must be under review" });
    }

    if ((req as any).user.role !== "FINANCE") {
      return res.status(403).json({ message: "Only Finance can approve" });
    }

    await PayrollStatusHistory.create({
      payrollId: payroll.id,
      oldStatus: payroll.status,
      newStatus: "APPROVED",
      changedBy: (req as any).user.id,
    });

    payroll.status = "APPROVED";
    await payroll.save();

    res.json({ message: "Payroll approved", payroll });
  } catch (error) {
    res.status(500).json({ message: "Approval failed" });
  }
};


// ===============================
// Reject Payroll
// ===============================
export const rejectPayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payroll = await Payroll.findByPk(id);
    if (!payroll) return res.status(404).json({ message: "Not found" });

    if (payroll.status !== "UNDER_REVIEW") {
      return res.status(400).json({ message: "Payroll must be under review" });
    }

    await PayrollComment.create({
      payrollId: payroll.id,
      userId: (req as any).user.id,
      comment: `REJECTION: ${reason}`,
    });

    await PayrollStatusHistory.create({
      payrollId: payroll.id,
      oldStatus: payroll.status,
      newStatus: "REJECTED",
      changedBy: (req as any).user.id,
    });

    payroll.status = "REJECTED";
    await payroll.save();

    res.json({ message: "Payroll rejected", payroll });
  } catch (error) {
    res.status(500).json({ message: "Rejection failed" });
  }
};