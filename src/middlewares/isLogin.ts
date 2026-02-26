import type{ Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { handleError } from "../helpers/errorHandler.js";
import { log } from "node:console";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      userId: string;
    };    

    req.user = {
      id: decoded.userId,
    };

    next();

  } catch (err: any) {
      handleError(res, err, "invalid token");
    };
  }