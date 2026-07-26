import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions  } from "jsonwebtoken";
import { models } from "../models";
import dotenv from "dotenv";


const {  Admin } = models;

dotenv.config();

export const checkhealth =  ( req: Request, res: Response ) => {
  res.json({ message: "The Server is Healthy..." });
}


export const generateToken = (id: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  const payload = { id };

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "1d") as unknown as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
}

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      otherNames,
      gender,
      dob,
      email,
      password,
      name, 
      user_type
    } = req.body;

    const exists = await Admin.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Admin.create({
      firstName,
      lastName,
      otherNames,
      gender,
      dob,
      email,
      name,
      user_type,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered",
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await Admin.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user.id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.user_type
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Profile (protected)
export const profile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const user = await Admin.findByPk(req.user.id, {
      attributes: ["id", "name", "email"],
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
}

// Get User By ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await Admin.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Update User
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, otherNames,  gender,  dob,
      primaryContact, secondaryContact, physicalAddress, postalAddress,
      role, department, status, station } = req.body;

    const user = await Admin.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (otherNames) user.otherNames = otherNames;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;

    if (primaryContact) user.primaryContact = primaryContact;
    if (secondaryContact) user.secondaryContact = secondaryContact;
    if (physicalAddress) user.physicalAddress = physicalAddress;
    if (postalAddress) user.postalAddress = postalAddress;

    if (role) user.role = role;
    if (department) user.department = department;
    if (status) user.status = status;
    if (station) user.station = station;
    // Note: password changes no longer happen here — see resetPassword below.
    // (This endpoint used to accept a `password` field with no auth check at
    // all, which meant anyone who could reach the API could silently take
    // over any account. Password changes now go through a dedicated,
    // admin-only endpoint instead.)

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

// Reset a user's password — admin (ICT) only. There's no email/SMTP set up
// for this system, so this is the whole "reset password" flow: an ICT admin
// sets a new password for the affected user from the admin panel and shares
// it with them directly (in person, over the phone, etc).
export const resetPassword = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await Admin.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: `Password reset for ${user.name || user.email}`,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

// Self-service "forgot password" — for a user who still remembers their
// current password. There's no email/SMTP set up for this system, so this
// page can't verify identity via a reset link; instead the user proves who
// they are by supplying their current (old) password, and the endpoint
// swaps it for the new one they choose. This is separate from, and doesn't
// replace, the admin-only resetPassword above — that one stays for users
// who have genuinely lost access and can't supply an old password at all.
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Email, old password and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from the old password" });
    }

    const user = await Admin.findOne({ where: { email } });
    if (!user) {
      // Same generic message as login — don't reveal whether the email exists.
      return res.status(400).json({ message: "Invalid email or old password" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or old password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully. You can now log in with your new password." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}

// Get All Users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await Admin.findAll({
      // attributes: ["id", "name", "email"], // exclude password
      order: [["id", "DESC"]]
    });

    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
}



