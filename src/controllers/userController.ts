import { PrismaClient } from "@prisma/client";
import { handleError } from "../helpers/errorHandler.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/isLogin.js";

const prisma = new PrismaClient();

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });

  } catch (err: any) {
    handleError(res, err, "Failed to fetch user");
  }
};