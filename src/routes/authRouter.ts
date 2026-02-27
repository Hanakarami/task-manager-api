import express from "express";
import { signup, login, logOut, refreshAccessToken } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/isLogin.js"

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout",requireAuth, logOut);
router.post("/refresh",requireAuth, refreshAccessToken);

export default router;