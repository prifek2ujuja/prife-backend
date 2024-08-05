import express from "express";
import {
  addLike,
  createProduct,
  deleteProduct,
  editProduct,
  editProductStock,
  getProductImages,
  getTopProducts,
  listProducts,
  lowStockProducts,
} from "../controllers/product.js";
import { isAuthorized } from "../middleware/index.js";

const router = express.Router();

router.post("", isAuthorized, createProduct);
router.get("", listProducts);
router.get("/lowstock", isAuthorized, lowStockProducts);
router.put("/:productId", isAuthorized, editProduct);
router.post("/like/:productId", addLike);
router.get("/top", getTopProducts);
router.put("/:productId", isAuthorized, editProduct);
router.put("/:productId/stock", isAuthorized, editProductStock);
router.get("/:productId/images", getProductImages);
router.delete("/:productId", isAuthorized, deleteProduct);

export default router;
