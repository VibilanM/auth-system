import express from "express";
import userRoutes from "./routes/userRoute.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World.");
});

app.use("/users", userRoutes);

app.use("/auth", authRoutes);

export default app;