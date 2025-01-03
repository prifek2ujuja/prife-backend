import Product from "../models/product/index.js";
import DailyReport, { DailyProductReport } from "../models/report/index.js";
import cron from "node-cron";

//generate the final report
//send email with link to download report

// const generateExcelDocument = () => {

// }

const generateFinalDailyReport = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyReport = await DailyReport.create({
    productsReport: [],
  });
  const productReports = await DailyProductReport.find({
    createdAt: { $gte: today },
  });

  productReports.forEach(async (report) => {
    const product = await Product.findById(report.product?._id, { stock: 1 });
    const updatedProductReport = await DailyProductReport.findByIdAndUpdate(
      report._id,
      {
        closingStock: product?.stock,
      }
    );
    if (updatedProductReport) {
      dailyReport.productsReport.push(updatedProductReport);
    }
  });
  await dailyReport.save();
};

const scheduleGenerateDailyReport = () => {
  // create cron expression for 8:20 PM
  const cronExpression = "0 21 * * *"; // At 21:00 hours every day
  cron.schedule(cronExpression, generateFinalDailyReport);
};

export default scheduleGenerateDailyReport;
