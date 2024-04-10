/* eslint-disable no-invalid-this */
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import asyncHandler from 'express-async-handler'
// import { TransactionsScheme } from './Transactions.js';

interface IUser {
  userName: string;
  email: string;
  phoneNumber: string,
  password: string;
  role: string
  status: string
  avatar: string
  accessToken?: string;
  notifications: string[]
  refreshToken: string
}

interface IUserMethods {
  matchPassword(enteredPassword: string) : Promise<boolean>;
}
export const UserScheme = new Schema<IUser, {}, IUserMethods>(
  {
    userName: {
      type: String,
      required: true,
    },
    email: { type: String, unique: true },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'admin'
    },
    status: {
      type: String,
      required: true,
      default: 'active'
    },
    avatar: {
      type: String,
    },
    accessToken: {
      type: String || null,
    },
    notifications: {
      type: [String],
    },
    refreshToken: {
      type: String || null,
    },
  },
  {
    timestamps: true,
  }
);

UserScheme.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserScheme.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserScheme);
export default User;

