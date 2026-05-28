import { PrismaClient } from "@prisma/client";
import type { Response } from "express";
import type { AuthRequest } from "../middlewares/isLogin.js";
import { handleError } from "../helpers/errorHandler.js";

const prisma = new PrismaClient();

export const createTask = async ( req: AuthRequest , res: Response ) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });

  } catch (err) {
    handleError(res, err, "Failed to create task");
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {

}

export const getTaskById = async (req: AuthRequest, res: Response) => {

}

export const updateTask = async (req: AuthRequest, res: Response) => {

}

export const deleteTask = async (req: AuthRequest, res: Response) => {

}