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

export const getTasks = async ( req: AuthRequest , res: Response ) => {
  try {

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user!.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      tasks,
    });

  } catch (err) {
    handleError(res, err, "Failed to fetch tasks");
  }
};

export const getTaskById = async ( req: AuthRequest , res: Response ) => {
  try {

    const id = req.params.id as string;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      task,
    });

  } catch (err) {
    handleError(res, err, "Failed to fetch task");
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const id = req.params.id as string;

    const { title, description, status, priority, dueDate } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    if (dueDate !== undefined) {
      updateData.dueDate = new Date(dueDate);
    }

    const updatedTask = await prisma.task.update({
      where: {
        id,
      },

      data: updateData,
    });

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });

  } catch (err) {
    handleError(res, err, "Failed to update task");
  }
};

export const deleteTask = async ( req: AuthRequest , res: Response ) => {
  try {

    const id = req.params.id as string;

    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await prisma.task.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Task deleted successfully",
    });

  } catch (err) {
    handleError(res, err, "Failed to delete task");
  }
};