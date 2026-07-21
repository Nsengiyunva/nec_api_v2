import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { models } from "../models";

export interface AuthRequest extends Request {
  user?: { id: number; name?: string; user_type?: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = { id: decoded.id, name: decoded.name };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Must run *after* authMiddleware. Looks up the requesting user's own
// account (the JWT payload only carries the id) and only lets ICT accounts
// through — that's the same role the frontend already treats as "admin"
// for staff-DB/payroll deletion, so we're reusing the existing convention
// rather than inventing a new one.
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { Admin } = models;
    const requester = await Admin.findByPk(req.user?.id);
    if (!requester || requester.user_type !== "ICT") {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.user!.user_type = requester.user_type;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};