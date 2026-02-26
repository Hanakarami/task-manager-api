import { PrismaClient } from "@prisma/client";
import { handleError } from "../helpers/errorHandler.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const getUsers = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      select : {
        name : true,
        email : true
      }
    });
    res.json(users);
  } catch (err) {
    handleError(res, err, "Failed to fetch users");
  }
};