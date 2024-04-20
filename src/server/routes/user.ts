import express from "express";
import {
  deleteUser,
  editUserPassword,
  editUser,
  getAllUsers,
  handleRefreshToken,
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
  getSalesStats,
} from "../controllers/user.js";
import { isAuthorized } from "../middleware/index.js";

const router = express.Router();

router.get("", isAuthorized, getAllUsers);
router.post("", registerUser);
router.post("/login", loginUser);
router.post("/refresh", handleRefreshToken);
router.post("/logout", isAuthorized, logoutUser);
router.put("/passwordchange/:id", isAuthorized, editUserPassword);
router.put("/:id", isAuthorized, editUser);
router.get("/:id", isAuthorized, getUserProfile);
router.delete("/:productId", isAuthorized, deleteUser);
router.get("/sales/leaderboard", isAuthorized, getSalesStats);

export default router;
