import "dotenv/config";
import express from "express";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import config from "./config.js";
import colors from "colors";
import productRouter from "./routes/project.js";
import orderRouter from "./routes/order.js";
import userRouter from "./routes/user.js";
import reportRouter from "./routes/report.js";
import scheduleGenerateDailyReport from "./jobs/dailyReport.js";


const app = express();

//set up nodemailer

// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: process.env.MAIL_USERNAME,
//     pass: process.env.MAIL_PASSWORD,
//     clientId: process.env.OAUTH_CLIENTID,
//     clientSecret: process.env.OAUTH_CLIENT_SECRET,
//     refreshToken: process.env.OAUTH_REFRESH_TOKEN,
//   },
// });

// schedule cron jobs
scheduleGenerateDailyReport();

// Set up mongodb.
mongoose
  .connect(config.mongo_uri, {
    maxPoolSize: 10,
    dbName: config.environment === "development" ? "development" : "production",
  })
  .then(() => {
    console.log(colors.yellow("🛢️ MongoDB Cluster connected"));
  })
  .catch((err) => {
    console.log(colors.red(err));
    process.exit(1);
  });

// Set up middleware

app.use(
  cors({
    origin: [
      "http://localhost:5000",
      // "http://localhost:5001",
      "https://prifek2u-pos.vercel.app",
      "https://prifeonlinestore-production.up.railway.app",
      "52.31.139.75",
      "52.49.173.169",
      "52.214.14.220",
    ],
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(morgan("tiny"));

// const testDailyReportJob = async () => {
//   console.log('test daily report running')
//   // edit stock to a product to trigger creation of a report
//   // find product reports created today
//   const product = await Product.findById("65b933a07262705a95da9cb5");
//   const productReport = await DailyProductReport.create({
//     product,
//     addedStock: 0,
//     closingStock: product?.stock,
//     openingStock: product?.stock,
//     sales: 0,
//     removedStock: 0,
//   });
//   // create a daily report
//   const dailyReport = await DailyReport.create({
//     productsReport: []
//   })
//   dailyReport.productsReport.push(productReport)
//   await dailyReport.save()
//   // add the product report
// };
// testDailyReportJob()

// Set up routes
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/users", userRouter);
app.use("/api/reports", reportRouter);

app.get("/hello", (_, res) => {
  res.send("PRIFE is live!");
});

// ViteExpress.listen(app, 3000, () =>
//   console.log("Server is listening on port 3000..."),
// );

const port = process.env.PORT || 4400;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}...`);
});
