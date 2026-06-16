import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    },
    verificationTokenExpiration: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordTokenExpiration: {
        type: Date
    }
},
    {
        timestamps: true
    });

export default mongoose.model("User", userSchema);