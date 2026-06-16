import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";
import crypto from "crypto";
import transporter from "../utils/sendEmail.js";


async function createUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = await User.create({
            username: username,
            email: email,
            password: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpiration: Date.now() + 24 * 60 * 60 * 1000
        });

        const verificationUrl = `http://localhost:${PORT}/auth/verify-email/${verificationToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Verify your account",
            html: `
            <h2>Welcome!</h2>
            
            <p>Click below to verify your account:</p>
            
            <a href="${verificationUrl}">Verify Email</a>
            
            `
        });

        res.status(201).json({
            message: "Check your email to verify your account."
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials."
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials."
            });
        }

        const accessToken = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            {
                userId: user._id
            },
            process.env.REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        await RefreshToken.create({
            token: refreshToken,
            userId: user._id
        });

        res.status(200).json({
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

async function profile(req, res) {
    try {
        const user = await User
            .findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User not found."
            });
        }

        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error."
        });
    }
}

async function refresh(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token required."
        });
    }

    try {

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET
        );

        const storedToken = await RefreshToken.findOne({
            token: refreshToken
        });

        if (!storedToken) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }

        await RefreshToken.deleteOne({
            token: refreshToken
        });

        const newRefreshToken = jwt.sign(
            {
                userId: decoded.userId
            },
            process.env.REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );

        const accessToken = jwt.sign(
            {
                userId: decoded.userId
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        await RefreshToken.create({
            token: newRefreshToken,
            userId: decoded.userId
        });

        res.status(200).json({
            accessToken: accessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        res.status(403).json({
            message: "Invalid refresh token."
        });
    }
}

async function logout(req, res) {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Refresh token required."
            });
        }

        await RefreshToken.deleteOne({
            token: refreshToken
        });

        res.status(200).json({
            message: "Logged out successfully."
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal server error."
        });
    }
}

async function verifyEmail(req, res) {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiration: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired token."
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiration = undefined;

        await user.save();

        res.status(200).json({
            message: "Email verified successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error."
        });
    }
}

export { createUser, loginUser, profile, refresh, logout, verifyEmail };