import express from "express";
import { getDailyReports } from "../controllers/report.js";
import { isAuthorized } from "../middleware/index.js";
const router = express.Router();

router.get("", isAuthorized ,getDailyReports)

export default router