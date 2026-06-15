import User from "../models/User.js";

async function getUser(req, res) {
    const users = await User.find();
    res.json(users);
}

export default getUser;