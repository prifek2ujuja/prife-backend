import express from 'express'
import { createOrder, deleteOrder, editOrder, getOrderStats, getRecentSales, listOrders, ordersGraphData } from '../controllers/order.js'
import { isAuthorized } from '../middleware/index.js'

const router = express.Router()

router.get("", isAuthorized,listOrders)
router.get("/trends", isAuthorized, ordersGraphData)
router.get("/stats", isAuthorized, getOrderStats);
router.get("/recent", isAuthorized, getRecentSales)
router.post("", createOrder)
router.put("/:id",isAuthorized, editOrder)
router.delete("/:id",isAuthorized, deleteOrder)

export default router