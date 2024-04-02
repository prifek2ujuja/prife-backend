import expressAsyncHandler from "express-async-handler";
import DailyReport from "../models/report/index.js";

export const getDailyReports = expressAsyncHandler(async (req, res) => {
    try {
        const reports = await DailyReport.find().sort({createdAt: -1})
        res.json(reports).status(200)
    } catch (error) {
        res.status(500).json({message: "Unable to fetch reports"})
    }
})