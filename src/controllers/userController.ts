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

export const createUser = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;
    const hashedPass = await bcrypt.hash(password,12);
    const newUser = await prisma.user.create({
      data: { name, email, password:hashedPass },
    });
    res.status(201).json(newUser);
  } catch (err: any) {
    handleError(res, err, "Failed to create user");
  }
};