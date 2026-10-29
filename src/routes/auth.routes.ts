import { Router } from "express";
import { login, register, getMe } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Endpoint POST /auth/login
router.post("/login", login);

// Endpoint POST /auth/register
router.post("/register", register);

// Endpoint GET /auth/me
router.get("/me", authenticateToken, getMe);

export default router;
