import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: "Too many attempts. Please try again later."
    }
});

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        message: "Too many attempts. Please try again later."
    }
});

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        message: "Too many attempts. Please try again later."
    }
});


export { loginLimiter, signupLimiter, passwordResetLimiter };