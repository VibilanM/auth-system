import express from "express";
import { createUser, loginUser, profile, refresh } from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", loginUser);

router.get("/profile", authenticate, profile);
router.post("/refresh", refresh);   

export default router;