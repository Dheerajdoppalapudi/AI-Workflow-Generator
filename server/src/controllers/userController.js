import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../utils/prisma.js";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export const register = async (req, res) => {
  const { email, password, username, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Generate a username if one isn't provided
  const finalUsername = username || req.body.name?.replace(/\s+/g, '_').toLowerCase();

  if (!finalUsername) {
    return res.status(400).json({ error: "Username or name is required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await db.user.create({
      data: { 
        email, 
        password: hashedPassword,
        username: finalUsername,
        role: role || "USER"  // Use provided role or default to USER
      },
    });
    
    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({ 
      message: "User created successfully", 
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: "User already exists or invalid data" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }

  try {
    // Find the user by username
    const user = await db.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    // JWT token with username and role
    const token = jwt.sign({ 
      userId: user.id,
      username: user.username,
      role: user.role
    }, SECRET_KEY, {
      expiresIn: "7h",
    });

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;

    res.json({ 
      token, 
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await db.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Don't return the password
    const { password, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  const { email } = req.body;
  
  try {
    const updatedUser = await db.user.update({
      where: { id: req.user.userId },
      data: { email }
    });
    
    // Don't return the password
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json({ 
      message: "Profile updated successfully", 
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};