import User from '../models/user/index.js'; // Assuming your User model file is in the same directory as your controllers
import bcrypt from "bcryptjs";
import asyncHandler from 'express-async-handler'
import {generateToken, generateRefreshToken} from "../utils/jwt/sign.js"
import { faker } from '@faker-js/faker';
import jwt from "jsonwebtoken";
import config from "../config.js"

// Register a new user
export const registerUser =  asyncHandler(async (req, res) => {
   const { userName, phoneNumber, password, email, role, status } = req.body;
  try {
    const findOneUser = await User.findOne({ email });
    if (findOneUser) {
      res.status(400).json({
        message: "User already exists. Would you like to log in instead?",
      });
      return
    }
    await User.create({
      userName,
      password,
      phoneNumber,
      email,
      role,
      status,
      notifications: [],
      avatar: faker.image.avatar(),
    });
    res.status(201).json({ status: "created" });
  } catch (error) {
    res.status(500).json({ message: "Unable to create user" });
  }
});

// Login user
export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return
    }

    const isMatch = await user!.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return
    }
    // Generate token and send response
     const accessToken = generateToken({role: user?.role as string, userId: user?._id})
    user!.refreshToken = generateRefreshToken({role: user?.role as string, userId: user?._id})
    await user?.save()
    res.status(200).json({
      avatar: user.avatar,
      refreshToken: user.refreshToken,
      role: user.role,
      status: user.status,
      userName: user.userName,
      token: accessToken,
      id: user._id
    })
  } catch (error) {
    res.status(500).json({ message: "unable to login" });
  }
});

export const logoutUser = asyncHandler(async (_req, res) => {
  // Logout the user by removing the refreshToken from the DB
  // Check cookies in the request body
  try {
    const oneUser = await User.findById(_req.userId, {
      refreshToken: 1,
    });
    
    if (!oneUser) {
      res.status(404).json({"message": "User not found"})
      return
    }

    oneUser.refreshToken = null;
    await oneUser.save();
    res.status(200).json({message: "logged out"});
    return

  } catch (error) {
    res.status(500).json({ message: "Server error. unable to logout" });
  }
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete user" });
  }
});

// Edit user password
export const editUserPassword = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Unable to update password" });
  }
});

// Edit user status and role
export const editUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const editData = req.body;

    console.log("edit data: ", editData)

    const user = await User.findByIdAndUpdate(id, editData);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return
    }
    await user.save();

    res.status(200).json({ message: 'User data updated successfully' });
  } catch (error) {
    console.log("error: ", error)
    res.status(500).json({ message: "Unable to update user" });
  }
});

// Get user profile

export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
    if (!user) {
      res.status(404).json({"message": "user not found"})
    }
    res.status(200).json({
      userName: user?.userName,
      phoneNumber: user?.phoneNumber,
      email: user?.email,
      notifications: user?.notifications,
      avatar: user?.avatar
    })
  } catch (error) {
    console.log("profile error: ", error)
    res.status(500).json({"message": "unable to get user profile"})
  } 
}) 

// Get a new access token if expired


export const handleRefreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.sendStatus(401);
  }
  // If there is a refresh token, find the user with that refreshToken
  const user = await User.findOne({ refreshToken });
  if (!user) {
    // The user was not found because the refreshToken changed.
    // The only reason this can happen is if the user logged in from a different device
    res.sendStatus(404);
  }
  try {
    const decoded = jwt.verify(refreshToken, config.refresh_token_secret);
    
    const accessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      config.access_token_secret,
      { expiresIn: "2h" }
    );
    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    res.sendStatus(403);
  }
});

// get all orders
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().sort({createdAt: -1})
    res.json(users).status(200)
  } catch (error) {
    console.log("cant fetch users")
    res.status(500).json({message: "cant fetch users"})
  }
})

export const getSalesStats = asyncHandler(async (req, res) => {
  try {
    
    
  } catch (error) {
    console.log("cant fetch users")
    res.status(500).json({message: "cant fetch users"})
  }
 })