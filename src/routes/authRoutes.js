import express from "express";
import { createUser, loginUser, profile } from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", loginUser);

router.get("/profile", authenticate, profile);

export default router;