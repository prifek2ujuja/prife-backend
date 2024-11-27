import express from "express";
import {
  addLike,
  createProduct,
  deleteProduct,
  editProduct,
  editProductStock,
  getProductImages,
  getPopularProducts,
  listProducts,
  lowStockProducts,
  getTherapyDevices,
  getSupplements,
  addStoreStock,
  productStats,
} from "../controllers/product.js";
import { isAuthorized } from "../middleware/index.js";

const router = express.Router();

router.post("", isAuthorized, createProduct);
router.get("", listProducts);
router.get("/lowstock", isAuthorized, lowStockProducts);
router.put("/:productId", isAuthorized, editProduct);
router.post("/like/:productId", addLike);
router.get("/popular", getPopularProducts);
router.get("/therapy", getTherapyDevices);
router.get("/stats", isAuthorized, productStats);
router.get("/supplement", getSupplements);
router.put("/:productId", isAuthorized, editProduct);
router.put("/:productId/stock", isAuthorized, editProductStock);
router.put("/:productId/store", isAuthorized, addStoreStock);
router.get("/:productId/images", getProductImages);
router.delete("/:productId", isAuthorized, deleteProduct);


export default router;
