import mongoose from "mongoose";

const SignUpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Your forget to add your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "kindly enter you phone number"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "address is needed"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password required"],
      trim: true,
    },
    profilePhoto: {
      type: String,
      trim: true,
      default: "default.jpg",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", SignUpSchema);

export default User;
