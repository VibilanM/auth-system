import User from "../models/User.js";
import bcrypt from "bcrypt";

async function createUser(req, res) {
    try {
        const hashedPassword = await bcrypt.hash(
            req.body.password,
            10
        );

        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User created successfully."
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

async function getUser(req, res) {
    const users = await User.find();
    res.json(users);
}

export { createUser, getUser };