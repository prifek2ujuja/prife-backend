import express from "express";
import {
  createOrder,
  deleteOrder,
  editOrder,
  editOrderStatus,
  filterOrders,
  getOrderStats,
  getRecentSales,
  getSalesLeaderBoard,
  listOrders,
  ordersGraphData,
  processOnlineOrder,
} from "../controllers/order.js";
import { isAuthorized } from "../middleware/index.js";

const router = express.Router();

router.get("", isAuthorized, listOrders);
router.get("/trends", isAuthorized, ordersGraphData);
router.get("/stats", isAuthorized, getOrderStats);
router.get("/recent", isAuthorized, getRecentSales);
router.get("/filter", isAuthorized, filterOrders);
router.post("", isAuthorized, createOrder);
router.get("/leaderboard", isAuthorized, getSalesLeaderBoard);
router.put("/status", editOrderStatus);
router.put("/:id", isAuthorized, editOrder);
router.delete("/:id", isAuthorized, deleteOrder);
router.post("/process", processOnlineOrder);

export default router;
