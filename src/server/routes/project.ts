import express from "express";
import { createProduct, deleteProduct, editProduct, getProductImages, listProducts, lowStockProducts } from "../controllers/product.js";
import { isAuthorized } from "../middleware/index.js";

const router = express.Router()

router.post("",isAuthorized, createProduct)
router.get("", isAuthorized, listProducts)
router.get("/lowstock", isAuthorized, lowStockProducts)
router.put("/:productId", isAuthorized, editProduct)
router.get("/:productId/images", getProductImages)
router.delete("/:productId", isAuthorized, deleteProduct)


export default router;
        