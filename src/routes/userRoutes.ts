import express from "express";
import { getMe } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/isLogin.js";

const router = express.Router();

router.get("/getme",requireAuth, getMe);

export default router;