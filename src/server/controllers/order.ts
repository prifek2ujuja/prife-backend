import asyncHandler from 'express-async-handler'
import Order from '../models/order/index.js';
import Customer from '../models/customer/index.js';
import Product from '../models/product/index.js';
import { DailyProductReport } from '../models/report/index.js';
import User from '../models/user/index.js';


export const listOrders = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find().sort({createdAt: -1})
        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({message: 'Unable to get documents'})
    }
})

export const createOrder = asyncHandler(async (req, res) => {
    const { customer, orderItems, paymentStatus, orderTotal, paymentMode, refCode } = req.body
    let customerId;
    const user = await User.findById(req.userId)
    console.log("user: ", user)
    try { // Assuming the data is sent in the request body
        if (customer) {
            const existingCustomer = await Customer.findOne({name: customer.name, phone: customer.phone, email: customer.email})
            if (existingCustomer) {
                customerId = existingCustomer._id
            } else {
                const newCustomer = await Customer.create({
                    name: customer.name,
                    phone: customer.phone,
                    // email: customer.email
                })
                customerId = newCustomer._id
            }
        }
        // const customer = Customer.findOne({})
        const createdOrder = await Order.create({
            customerId,
            orderItems,
            paymentStatus,
            orderTotal,
            paymentMode,
            refCode,
            salesPerson: user
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        orderItems.forEach(async (item) => {
            const product = await Product.findById(item.product._id)
            if (product) {
                const productReport = await DailyProductReport.findOne({createdAt: { $gte: today }, product: product._id})
                if (productReport) {
                    productReport.sales = productReport.sales + 1;
                    await productReport.save()
                } else {
                    await DailyProductReport.create({
                        product: product._id,
                        openingStock: product.stock,
                        addedStock: 0,
                        sakes: 1,
                    })
                }
                product.stock = product?.stock - item.quantity
                await product.save()
            }  
        })
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

export const editOrder = asyncHandler(
    async (req, res) => {
    try {
        const { id } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedOrder) {
            res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
)

export const deleteOrder = asyncHandler(
    async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
             res.status(404).json({ message: 'Order not found' });
        }
        res.status(204).send(); // No content for successful deletion
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
)

export const ordersGraphData = asyncHandler(
    async (_req, res) => {
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
                    createdAt: { $gte: thirtyDaysAgo } // Filter orders for the last 30 days
                    }
                },
                {
                    $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by date
                    total: { $sum: "$orderTotal" } // Calculate total order value
                    }
                },
                {
                    $sort: { _id: 1 } // Sort results by date
                }
            ])

            const ordersTotalByYear = await Order.aggregate([
                {
                    $match: {
                    createdAt: { $gte: sixYearsAgo } // Filter orders for the last 6 years
                    }
                },
                {
                    $group: {
                    _id: { $year: "$createdAt" }, // Group by year
                    total: { $sum: "$orderTotal" } // Calculate total order value
                    }
                },
                {
                    $sort: { _id: 1 } // Sort results by year
                }
            ])

            const ordersTotalByMonth = await Order.aggregate([
                {
                    $match: {
                    createdAt: { $gte: sixMonthsAgo } // Filter orders for the last 6 months
                    }
                },
                {
                    $group: {
                    _id: {
                        year: { $year: "$createdAt" }, // Group by year
                        month: { $month: "$createdAt" } // Group by month
                    },
                    total: { $sum: "$orderTotal" } // Calculate total order value
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 } // Sort results by year and month
                }
            ]);

            res.json({ ordersTotalByDay, ordersTotalByYear, ordersTotalByMonth });
        } catch (error) {
            console.log("orders graph error: ", error)
            res.status(500).json({message: "Unable to fetch graph data"})
        }
    }
)

export const getOrderStats = asyncHandler(async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const oneWeekAgo = new Date();
        oneWeekAgo.setHours(oneWeekAgo.getDay() - 7)

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
        const nullStat = {_id: null, totalOrders: 0, totalValue: 0}
        res.json({
            ordersInLastOneWeek: ordersInLastOneWeek[0] || nullStat,
            ordersInLastTwentyFourHours: ordersInLastTwentyFourHours[0] || nullStat,
            allTimeOrders: allTimeOrders[0] || nullStat
        }).status(200)


    } catch (error) {
        res.status(500).json({message: "unable to fetch order stats"})
    }
})

// Get recent sales
export const getRecentSales = asyncHandler(async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const orders = await Order.find({
        createdAt: { $gte: twentyFourHoursAgo }
        });

        res.json(orders).status(200);
    } catch (error) {
        res.status(500).json({"message": "unable to fetch recent sales"})
    }
})

export const getSalesLeaderBoard = asyncHandler(async (req, res) => {
    try {
        const salesLeaders = await Order.aggregate([
            {
                $group: {
                    _id: "$salesPerson",
                    totalSales: { $sum: "$orderTotal" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "salesPerson"
                }
            },
            {
                $sort: { totalSales: -1 }
            }
        ])

        res.json(salesLeaders).status(200)
    } catch (error) {
        res.status(500).json({message: "unable to fetch sales leaders"})
    }
})