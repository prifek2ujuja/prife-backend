import express from 'express'
import { createOrder, deleteOrder, editOrder, getOrderStats, getRecentSales, getSalesLeaderBoard, listOrders, ordersGraphData } from '../controllers/order.js'
import { isAuthorized } from '../middleware/index.js'

const router = express.Router()

router.get("", isAuthorized,listOrders)
router.get("/trends", isAuthorized, ordersGraphData)
router.get("/stats", isAuthorized, getOrderStats);
router.get("/recent", isAuthorized, getRecentSales)
router.post("", isAuthorized, createOrder)
router.get("/leaderboard", isAuthorized, getSalesLeaderBoard);
router.put("/:id",isAuthorized, editOrder)
router.delete("/:id",isAuthorized, deleteOrder)

export default router