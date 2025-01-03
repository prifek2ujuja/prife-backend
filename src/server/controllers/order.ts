import asyncHandler from "express-async-handler";
import Order from "../models/order/index.js";
import Customer from "../models/customer/index.js";
import Product from "../models/product/index.js";
import { DailyProductReport } from "../models/report/index.js";
import User from "../models/user/index.js";
import axios from "axios";
import config from "../config.js";
import { acceptPayment } from "../utils/paystack.js";
import crypto from "crypto";
import { allFakers } from "@faker-js/faker";

export const listOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Unable to get documents" });
  }
});

export const createOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    orderItems,
    paymentStatus,
    orderTotal,
    paymentMode,
    refCode,
    delivery,
    address: deliveryAddress,
  } = req.body;
  let customerId;

  try {
    const user = await User.findById(req.userId);

    console.log("userId: ", req.userId);

    console.log("user: ", user);
    // Assuming the data is sent in the request body
    if (customer) {
      const existingCustomer = await Customer.findOne({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      });
      if (existingCustomer) {
        customerId = existingCustomer._id;
      } else {
        const newCustomer = await Customer.create({
          name: customer.name,
          phone: customer.phone,
          // email: customer.email
        });
        customerId = newCustomer._id;
      }
    }
    // const customer = Customer.findOne({})
    

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    orderItems.forEach(async (item) => {
      const product = await Product.findById(item.product._id);
      if (product) {
        // const updatedDailyProductReport =
        //   await DailyProductReport.findOneAndUpdate(
        //     {
        //       createdAt: { $gte: today },
        //       product: product._id,
        //     },
        //     { $inc: { sales: parseInt(item.quantity) } }
        //   );
        // if (!updatedDailyProductReport) {
        //   await DailyProductReport.create({
        //     product: product._id,
        //     openingStock: product?.stock,
        //     addedStock: 0,
        //     removedStock: 0,
        //     sales: parseInt(item.quantity),
        //   });
        // }
        if (item.quantity > product.inStore) {
          res.status(400).json({message: `Not enough ${product.name} to process this order`})
          return
        }
        product.inStore = product?.inStore - item.quantity;
        await product.save();
      }
    });
    const createdOrder = await Order.create({
      customerId,
      orderItems,
      paymentStatus,
      orderTotal,
      paymentMode,
      refCode,
      salesPerson: user ? user : undefined,
      delivery: delivery ? delivery : undefined,
      deliveryAddress: deliveryAddress ? deliveryAddress : undefined,
    });
    if (user) {
      user.ordersCount = user.ordersCount + 1;
      await user.save();
    }
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const editOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedOrder) {
      res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      res.status(404).json({ message: "Order not found" });
    }
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const ordersGraphData = asyncHandler(async (_req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixYearsAgo = new Date();
    sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);

    // Aggregate orders for the past 30 days
    const ordersTotalByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }, // Filter orders for the last 30 days
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
          total: { $sum: "$orderTotal" }, // Calculate total order value
        },
      },
      {
        $sort: { _id: 1 }, // Sort results by date
      },
    ]);

    const ordersTotalByYear = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixYearsAgo }, // Filter orders for the last 6 years
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" }, // Group by year
          total: { $sum: "$orderTotal" }, // Calculate total order value
        },
      },
      {
        $sort: { _id: 1 }, // Sort results by year
      },
    ]);

    const ordersTotalByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }, // Filter orders for the last 6 months
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" }, // Group by year
            month: { $month: "$createdAt" }, // Group by month
          },
          total: { $sum: "$orderTotal" }, // Calculate total order value
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sort results by year and month
      },
    ]);

    res.json({ ordersTotalByDay, ordersTotalByYear, ordersTotalByMonth });
  } catch (error) {
    console.log("orders graph error: ", error);
    res.status(500).json({ message: "Unable to fetch graph data" });
  }
});

export const getOrderStats = asyncHandler(async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const oneWeekAgo = new Date();
    oneWeekAgo.setHours(oneWeekAgo.getDay() - 7);

    const ordersInLastTwentyFourHours = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twentyFourHoursAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalValue: { $sum: "$orderTotal" },
        },
      },
    ]);

    const ordersInLastOneWeek = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalValue: { $sum: "$orderTotal" },
        },
      },
    ]);

    const allTimeOrders = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalValue: { $sum: "$orderTotal" },
        },
      },
    ]);
    const nullStat = { _id: null, totalOrders: 0, totalValue: 0 };
    res
      .json({
        ordersInLastOneWeek: ordersInLastOneWeek[0] || nullStat,
        ordersInLastTwentyFourHours: ordersInLastTwentyFourHours[0] || nullStat,
        allTimeOrders: allTimeOrders[0] || nullStat,
      })
      .status(200);
  } catch (error) {
    res.status(500).json({ message: "unable to fetch order stats" });
  }
});

export const getProductSalesStats = asyncHandler(async (req, res) => {
  try {
    const productStats = await Order.aggregate([
      {
        $unwind: "$orderItems", // Unwind the orderItems array
      },
      {
        $lookup: {
          from: "products", // Assuming the name of the products collection is "products"
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $unwind: "$productInfo", // Unwind the productInfo array
      },
      {
        $group: {
          _id: "$productInfo._id",
          productName: { $first: "$productInfo.name" },
          totalValue: { $sum: { $multiply: ["$productInfo.price", "$orderItems.quantity"] } },
        },
      },
    ]);

    console.log("product stats: ", productStats);

    res.status(200).json(productStats);
  } catch (error) {
    res.status(500).json({ message: "unable to fetch product sales stats" });    
  }
})

// Get recent sales
export const getRecentSales = asyncHandler(async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const orders = await Order.find({
      createdAt: { $gte: twentyFourHoursAgo },
    }).sort({ createdAt: -1 }).limit(5);

    res.json(orders).status(200);
  } catch (error) {
    res.status(500).json({ message: "unable to fetch recent sales" });
  }
});

export const getSalesLeaderBoard = asyncHandler(async (req, res) => {
  try {
    const salesLeaders = await Order.aggregate([
      {
        $match: {
          salesPerson: { $exists: true }, // Filter out orders without a salesPerson
        },
      },
      {
        $group: {
          _id: "$salesPerson",
          totalSales: { $sum: "$orderTotal" },
        },
      },
      {
        $lookup: {
          from: "users", // Assuming the name of the users collection is "users"
          localField: "salesPerson",
          foreignField: "_id",
          as: "salesPersonInfo",
        },
      },
      // {
      //   $unwind: "$salesPersonInfo", // Unwind to access user information
      // },
      // {
      //   $project: {
      //     _id: "$_id",
      //     salesPersonName: "$salesPersonInfo.userName", // Assuming the sales person's name is stored in the "name" field of the users collection
      //     totalSales: "$totalSales",
      //   },
      // },
      {
        $sort: { totalSales: -1 }, // Sort by totalSales in descending order
      },
    ]);
    res.json(salesLeaders).status(200);
  } catch (error) {
    res.status(500).json({ message: "unable to fetch sales leaders" });
  }
});

export const processOnlineOrder = asyncHandler(async (req, res) => {
  const {
    customer,
    orderItems,
    orderTotal,
    delivery,
    address: deliveryAddress,
  } = req.body;
  let customerId;

  try {
    console.log("customer: ", customer);
    // Assuming the data is sent in the request body
    if (customer) {
      const existingCustomer = await Customer.findOne({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      });
      if (existingCustomer) {
        customerId = existingCustomer._id;
      } else {
        const newCustomer = await Customer.create({
          name: customer.name,
          phone: customer.phone,
          // email: customer.email
        });
        customerId = newCustomer._id;
      }
    }
    // const customer = Customer.findOne({})
    const createdOrder = await Order.create({
      customerId,
      orderItems,
      orderTotal,
      delivery,
      deliveryAddress: deliveryAddress ? deliveryAddress : undefined,
    });

    res.status(200).json({
      _id: createdOrder._id,
      orderTotal: createdOrder.orderTotal,
      customerEmail: customer.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const editOrderStatus = asyncHandler(async (req, res) => {
  const { status, orderId, reference: paystackPaymentRef } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      status,
      paystackPaymentRef,
    });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "unable to change order status" });
  }
});

export const processOnlineOrderCallback = asyncHandler(async (req, res) => {
  //validate event
  try {
    const secret = config.paystack_secret_key;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash == req.headers["x-paystack-signature"]) {
      // Retrieve the request's body

      const event = req.body;
      const { status, reference, amount } = event;
      const order = await Order.findOne({ paystackPaymentRef: reference });
      if (
        order &&
        order.orderTotal === parseInt(amount) &&
        status === "success"
      ) {
        order.status = "processed";
        order.statusDescription = "payment successful";
        await order.save();

        res.status(200).json("ok");
      }
      // Do something with event
    }
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
});

export const filterOrders = asyncHandler(async (req, res) => {
  /**
   * Filter orders by status, payment status, date range, sales person
   */

  const {
    status,
    paymentMode,
    refCode,
    startDate,
    endDate,
    salesPersonId,
    page,
    limit,
  } = req.query;

  if (
    !status &&
    !paymentMode &&
    !refCode &&
    !startDate &&
    !endDate &&
    !salesPersonId
  ) {
    res
      .status(400)
      .json({ message: "At least one filter parameter must be provided" });
    return;
  }

  try {
    const match: {
      status?: string;
      refCode?: string;
      createdAt?: any;
      endDate?: string;
      paymentMode?: string;
    } = {};

    if (status) {
      match.status = status as string;
    }

    if (refCode) {
      match.refCode = refCode as string;
    }

    if (paymentMode) {
      match.paymentMode = paymentMode as string;
    }

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    } else if (startDate && !endDate) {
      match.createdAt = { $gte: new Date(startDate as string) };
    } else if (endDate && !startDate) {
      match.createdAt = { $lte: new Date(endDate as string) };
    }

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 as 1 | -1 } },
      // { $skip: parseInt(page as string) * parseInt(limit) },
      // { $limit: parseInt(limit) },
    ];
    const orders = await Order.aggregate(pipeline);
    res.status(200).json(orders);
    return;
  } catch (error) {
    console.error("error on filter orders: ", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
});
