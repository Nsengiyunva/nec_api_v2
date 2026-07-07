import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { sequelize } from "../config/database";
import { models } from "../models";

const { Staff, StaffChild, StaffSpouse } = models;

// Fields that must never be sent back to the client
const SENSITIVE_FIELDS = ["password"];

function sanitize(staff: any) {
  if (!staff) return staff;
  const plain = typeof staff.toJSON === "function" ? staff.toJSON() : staff;
  for (const field of SENSITIVE_FIELDS) delete plain[field];
  return plain;
}

function generateStaffCode(id: number) {
  return `NEC-${String(id).padStart(5, "0")}`;
}

// ── List all staff (with optional search) ──────────────────
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const where: any = {};
    if (search && String(search).trim() !== "") {
      const term = `%${String(search).trim()}%`;
      where[Op.or] = [
        { first_name: { [Op.like]: term } },
        { last_name: { [Op.like]: term } },
        { other_names: { [Op.like]: term } },
        { email_address: { [Op.like]: term } },
        { staff_id: { [Op.like]: term } },
        { department: { [Op.like]: term } },
        { position: { [Op.like]: term } },
      ];
    }

    const staff = await Staff.findAll({
      where,
      order: [["id", "DESC"]],
      include: [
        { model: StaffChild, as: "children" },
        { model: StaffSpouse, as: "spouses" },
      ],
    });

    const sanitized = staff.map(sanitize);

    res.json({ success: true, count: sanitized.length, staff: sanitized });
  } catch (error) {
    console.error("getAllStaff error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ── Get one staff record with children/spouses ──────────────
export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByPk(id, {
      include: [
        { model: StaffChild, as: "children" },
        { model: StaffSpouse, as: "spouses" },
      ],
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, staff: sanitize(staff) });
  } catch (error) {
    console.error("getStaffById error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ── Create staff (+ nested children / spouses) ──────────────
export const createStaff = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const {
      children = [],
      spouses = [],
      password,
      passcode,
      email_address,
      staff_id,
      ...rest
    } = req.body;

    if (!email_address) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "email_address is required" });
    }
    if (!password) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "password is required" });
    }
    if (!passcode) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "passcode is required" });
    }

    const existing = await Staff.findOne({ where: { email_address } });
    if (existing) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "A staff member with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await Staff.create(
      {
        ...rest,
        email_address,
        passcode,
        password: hashedPassword,
        staff_id: staff_id || undefined,
      } as any,
      { transaction: t }
    );

    // Auto-generate a business staff_id / staffID if none was supplied
    if (!staff.staff_id) {
      const code = generateStaffCode(staff.id);
      staff.staff_id = code;
      staff.staffID = code;
      await staff.save({ transaction: t });
    }

    const staffIdCode = staff.staff_id as string;

    if (Array.isArray(children) && children.length > 0) {
      await StaffChild.bulkCreate(
        children
          .filter((c: any) => c && (c.child_name || c.spouse_name))
          .map((c: any) => ({
            staff_id: staffIdCode,
            child_name: c.child_name || null,
            spouse_name: c.spouse_name || null,
            spouse_phone: c.spouse_phone || null,
            type: c.type || null,
          })),
        { transaction: t }
      );
    }

    if (Array.isArray(spouses) && spouses.length > 0) {
      await StaffSpouse.bulkCreate(
        spouses
          .filter((s: any) => s && s.spouse_name)
          .map((s: any) => ({
            staff_id: staffIdCode,
            spouse_name: s.spouse_name || null,
            spouse_phone: s.spouse_phone || null,
            type: s.type || null,
          })),
        { transaction: t }
      );
    }

    await t.commit();

    const created = await Staff.findByPk(staff.id, {
      include: [
        { model: StaffChild, as: "children" },
        { model: StaffSpouse, as: "spouses" },
      ],
    });

    res.status(201).json({ success: true, message: "Staff created", staff: sanitize(created) });
  } catch (error) {
    await t.rollback();
    console.error("createStaff error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ── Update staff (+ replace children / spouses) ─────────────
export const updateStaff = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { children, spouses, password, email_address, ...rest } = req.body;

    const staff = await Staff.findByPk(id, { transaction: t });
    if (!staff) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    if (email_address && email_address !== staff.email_address) {
      const existing = await Staff.findOne({ where: { email_address }, transaction: t });
      if (existing && existing.id !== staff.id) {
        await t.rollback();
        return res.status(400).json({ success: false, message: "Another staff member already uses this email" });
      }
      staff.email_address = email_address;
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && key in staff) {
        (staff as any)[key] = value;
      }
    });

    // Only re-hash/update the password if a new one was actually provided
    if (password && String(password).trim() !== "") {
      staff.password = await bcrypt.hash(password, 10);
    }

    // Make sure we have a business staff_id to key children/spouses on
    if (!staff.staff_id) {
      const code = generateStaffCode(staff.id);
      staff.staff_id = code;
      staff.staffID = code;
    }

    await staff.save({ transaction: t });

    const staffIdCode = staff.staff_id as string;

    if (Array.isArray(children)) {
      await StaffChild.destroy({ where: { staff_id: staffIdCode }, transaction: t });
      const toCreate = children.filter((c: any) => c && (c.child_name || c.spouse_name));
      if (toCreate.length > 0) {
        await StaffChild.bulkCreate(
          toCreate.map((c: any) => ({
            staff_id: staffIdCode,
            child_name: c.child_name || null,
            spouse_name: c.spouse_name || null,
            spouse_phone: c.spouse_phone || null,
            type: c.type || null,
          })),
          { transaction: t }
        );
      }
    }

    if (Array.isArray(spouses)) {
      await StaffSpouse.destroy({ where: { staff_id: staffIdCode }, transaction: t });
      const toCreate = spouses.filter((s: any) => s && s.spouse_name);
      if (toCreate.length > 0) {
        await StaffSpouse.bulkCreate(
          toCreate.map((s: any) => ({
            staff_id: staffIdCode,
            spouse_name: s.spouse_name || null,
            spouse_phone: s.spouse_phone || null,
            type: s.type || null,
          })),
          { transaction: t }
        );
      }
    }

    await t.commit();

    const updated = await Staff.findByPk(staff.id, {
      include: [
        { model: StaffChild, as: "children" },
        { model: StaffSpouse, as: "spouses" },
      ],
    });

    res.json({ success: true, message: "Staff updated", staff: sanitize(updated) });
  } catch (error) {
    await t.rollback();
    console.error("updateStaff error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ── Delete staff (+ cascade children / spouses) ─────────────
export const deleteStaff = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const staff = await Staff.findByPk(id, { transaction: t });
    if (!staff) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    if (staff.staff_id) {
      await StaffChild.destroy({ where: { staff_id: staff.staff_id }, transaction: t });
      await StaffSpouse.destroy({ where: { staff_id: staff.staff_id }, transaction: t });
    }

    await staff.destroy({ transaction: t });
    await t.commit();

    res.json({ success: true, message: "Staff deleted" });
  } catch (error) {
    await t.rollback();
    console.error("deleteStaff error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
