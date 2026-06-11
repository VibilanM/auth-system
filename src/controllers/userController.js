import User from "../models/User.js";

async function createUser(req, res) {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
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