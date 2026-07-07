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

// ── List staff (paginated, searchable, excludes soft-deleted) ──
export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { search, organisation, department, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 20, 1), 200);
    const offset = (pageNum - 1) * limitNum;

    const where: any = { deleted_at: null };
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
    if (organisation && String(organisation).trim() !== "") {
      where.organisation = String(organisation).trim();
    }
    if (department && String(department).trim() !== "") {
      where.department = String(department).trim();
    }

    const { rows, count } = await Staff.findAndCountAll({
      where,
      order: [["id", "DESC"]],
      limit: limitNum,
      offset,
      distinct: true, // required for an accurate count alongside the hasMany includes below
      include: [
        { model: StaffChild, as: "children" },
        { model: StaffSpouse, as: "spouses" },
      ],
    });

    res.json({
      success: true,
      staff: rows.map(sanitize),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount: count,
        totalPages: Math.max(Math.ceil(count / limitNum), 1),
      },
    });
  } catch (error) {
    console.error("getAllStaff error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ── Aggregate stats across ALL non-deleted staff (not just the current page) ──
export const getStaffStats = async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await sequelize.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN UPPER(status) = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN LOWER(position) = 'hod' THEN 1 ELSE 0 END) AS hods,
        COUNT(DISTINCT NULLIF(department, '')) AS departments
      FROM users
      WHERE deleted_at IS NULL
    `);

    const row = (rows && rows[0]) || {};

    res.json({
      success: true,
      stats: {
        total: Number(row.total) || 0,
        active: Number(row.active) || 0,
        hods: Number(row.hods) || 0,
        departments: Number(row.departments) || 0,
      },
    });
  } catch (error) {
    console.error("getStaffStats error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ── Get one staff record with children/spouses ──────────────
export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findOne({
      where: { id, deleted_at: null },
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

    const existing = await Staff.findOne({ where: { email_address, deleted_at: null } });
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
      const existing = await Staff.findOne({ where: { email_address, deleted_at: null }, transaction: t });
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

// ── Soft-delete staff: mark deleted_at, keep the record (and its
// children/spouses) fully intact in the database. Hidden from normal
// list/detail reads, but recoverable directly in the DB if ever needed.
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    if (staff.deleted_at) {
      return res.status(400).json({ success: false, message: "Staff member is already deleted" });
    }

    staff.deleted_at = new Date();
    await staff.save();

    res.json({ success: true, message: "Staff deleted" });
  } catch (error) {
    console.error("deleteStaff error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
