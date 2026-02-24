import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions  } from "jsonwebtoken";
import { Admin } from "../models/nec_user";
import dotenv from "dotenv";

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
};

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Admin.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

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
        email: user.email
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
      role, department, status, station,
      password } = req.body;

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
    // If password is provided → hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

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
};



