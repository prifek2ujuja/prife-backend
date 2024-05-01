import expressAsyncHandler from "express-async-handler";
import DailyReport from "../models/report/index.js";

export const getDailyReports = expressAsyncHandler(async (req, res) => {
  try {
    // const reports = await DailyReport.find()
    //   .populate({
    //     path: "productsReport.product", // Populate the product field in the DailyProductReportModel
    //     select: "name", // Select fields you want to include from the referenced product
    //   })
    //   .sort({ createdAt: -1 });
    const reports = await DailyReport.aggregate([
      {
        $unwind: "$productsReport", // Unwind the productsReport array
      },
      {
        $lookup: {
          from: "products", // Name of the referenced collection (assuming it's named "products")
          localField: "productsReport.product",
          foreignField: "_id",
          as: "productsReport.productInfo", // Add product information to "productInfo" field
        },
      },
      {
        $group: {
          _id: "$_id", // Group by daily report ID
          productsReport: { $push: "$productsReport" }, // Push the modified productsReport back into an array
          createdAt: { $first: "$createdAt" }, // Retain createdAt timestamp
          updatedAt: { $first: "$updatedAt" }, // Retain updatedAt timestamp
        },
      },
    ]);
    console.log("reports: ", reports[0].productsReport[0].productInfo);
    res.json(reports).status(200);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch reports" });
  }
});
