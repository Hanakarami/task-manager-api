import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type{ Request, Response } from "express";
import { handleError } from "../helpers/errorHandler.js";
import type{ AuthRequest } from "../middlewares/isLogin.js";

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

    const tokenHash = await bcrypt.hash(refreshToken, 12);

    const expiresIn = 60 * 60 * 24 * 30; 
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: newUser.id,
        expiresAt
      },
    });

    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: expiresIn * 1000, 
    };

    const accessCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 15 * 60 * 1000, 
    };

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("accessToken", accessToken, accessCookieOptions);

    res.status(201).json({ user: { name, email } });
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

    const tokenHash = await bcrypt.hash(refreshToken, 12);

    const expiresIn = 60 * 60 * 24 * 30; 
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await prisma.refreshToken.create({ data: { tokenHash, userId: user.id, expiresAt } });

    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: expiresIn * 1000, 
    };

    const accessCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 15 * 60 * 1000, 
    };

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("accessToken", accessToken, accessCookieOptions);

    res.json({ user: { name: user.name, email: user.email } });
  } catch (err: any) {
    handleError(res, err, "Login failed");
  }
};

export const logOut = async (req: AuthRequest, res: Response) => {
  try {

    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {

      const tokens = await prisma.refreshToken.findMany({
        where: {
          userId: req.user!.id,
        },
      });

      for (const token of tokens) {
        const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);

        if (isMatch) {
          await prisma.refreshToken.delete({
            where: {
              id: token.id,
            },
          });

          break;
        }
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (err: any) {
    handleError(res, err, "Logout failed");
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    let decoded: any;

    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const userId = decoded.userId;

    const tokens = await prisma.refreshToken.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    let validToken = null;

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(
        refreshToken,
        token.tokenHash
      );

      if (isMatch) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not recognized",
      });
    }

    const newAccessToken = jwt.sign(
      { userId },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });

  } catch (err: any) {
    handleError(res, err, "Refresh failed");
  }
};