import express from "express";
import { createUser, loginUser, profile, refresh, logout, verifyEmail, forgotPassword, resetPassword } from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", createUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginUser);

router.get("/profile", authenticate, profile);
router.post("/refresh", refresh);

router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;