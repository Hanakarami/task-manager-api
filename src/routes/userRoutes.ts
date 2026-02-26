import express from "express";
import { getUsers } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/isLogin.js";

const router = express.Router();

router.get("/",requireAuth, getUsers);

export default router;