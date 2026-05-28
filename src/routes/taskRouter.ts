import { Router } from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

import { requireAuth } from "../middlewares/isLogin.js";

const router = Router();

router.post("/", requireAuth, createTask);

router.get("/", requireAuth, getTasks);

router.get("/:id", requireAuth, getTaskById);

router.put("/:id", requireAuth, updateTask);

router.delete("/:id", requireAuth, deleteTask);

export default router;