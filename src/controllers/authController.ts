import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type{ Request, Response } from "express";
import { handleError } from "../helpers/errorHandler.js";

const prisma = new PrismaClient();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh-secret";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const accessToken = jwt.sign({ userId: newUser.id }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: newUser.id }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    const expiresIn = 60 * 60 * 24 * 30; 
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshToken,
        userId: newUser.id,
        expiresAt
      },
    });

    res.status(201).json({ user: { id: newUser.id, name, email }, accessToken, refreshToken });
  } catch (err: any) {
    handleError(res, err, "Signup failed");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email }, include: { tokens: true } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    const expiresIn = 60 * 60 * 24 * 30; 
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await prisma.refreshToken.create({ data: { tokenHash: refreshToken, userId: user.id, expiresAt } });

    res.json({ user: { id: user.id, name: user.name, email: user.email }, accessToken, refreshToken });
  } catch (err: any) {
    handleError(res, err, "Login failed");
  }
};