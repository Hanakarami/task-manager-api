import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRouter.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});