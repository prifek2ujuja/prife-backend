import "dotenv/config"
import express from "express";
import compression from "compression";
import cors from 'cors'
import morgan from 'morgan'
import ViteExpress from "vite-express";
import mongoose from "mongoose";
import config from "./config.js";
import colors from "colors";
import productRouter from './routes/project.js'
import orderRouter from './routes/order.js'
import userRouter from "./routes/user.js"
import reportRouter from "./routes/report.js"
import scheduleGenerateDailyReport from "./jobs/dailyReport.js";

const app = express();

// schedule cron jobs
scheduleGenerateDailyReport()


// Set up mongodb.
mongoose
  .connect(config.mongo_uri, {
    maxPoolSize: 10,
    dbName:
      config.environment === "development"
        ? "development"
        : "production",
  })
  .then(() => {
    console.log(colors.yellow("🛢️ MongoDB Cluster connected"));
  })
  .catch((err) => {
    console.log(colors.red(err));
    process.exit(1);
  });


// Set up middleware
app.use(compression());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json())
app.use(morgan("tiny"));


// Set up routes
app.use("/api/products", productRouter)
app.use("/api/orders", orderRouter)
app.use("/api/users", userRouter)
app.use("/api/reports", reportRouter)

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

// ViteExpress.listen(app, 3000, () =>
//   console.log("Server is listening on port 3000..."),
// );
  
app.listen(3000, () => {
  console.log("Server is listening on port 3000...");
});