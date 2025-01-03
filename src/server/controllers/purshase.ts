import expressAsyncHandler from "express-async-handler";
import { Purchase } from "../models/purchases/purshases.js";
import Product from "../models/product/index.js";

export const createPurchase = expressAsyncHandler(async (req, res) => {
   const { items } = req.body;

   try {
    let status = "received"
    let total = 0

    items.forEach(async (item: {productId: string, quantityOrdered: number, quantityReceived: number}) => {
        if (item.quantityReceived < item.quantityOrdered) {
            status = "pending"
        }
        const product = await Product.findById(item.productId)
        total += product?.purchasePrice * item.quantityOrdered
    })

    const purchase = await Purchase.create({
        user: req.userId,
        items,
        status,
        total
    })
    res.status(201).json(purchase)
   } catch (error) {
    res.status(500).json({ message: 'Error creating purchase' })
   }
})

export const getPurchases = expressAsyncHandler(async (req, res) => {
    try {
        const purchases = await Purchase.find()
   res.status(200).json(purchases)
    } catch (error) {
        res.status(500).json({ message: 'Error getting purchases' })
    }
})


export const processPurchase = expressAsyncHandler(async (req, res) => {
    const { purchaseId, items } = req.body

    try {
        const purchase = await Purchase.findById(purchaseId)
        if (!purchase) {
            return res.status(404).json({ message: 'Purchase not found' })
        }

        let status = "received"
        let extraItems: {product: string, quantityOrdered: number, quantityReceived: number}[] = []
        let extraItemsTotal = 0
        items.forEach(async (item: {productId: string, quantityReceived: number, quantityOrdered: number}) => {
            if (item.quantityReceived < item.quantityOrdered) {
                status = "pending"
            } else if (item.quantityReceived > item.quantityOrdered) {
                // Create a new purchase and add the extra items
                extraItems.push({
                    product: item.productId,
                    quantityOrdered: item.quantityReceived - item.quantityOrdered,
                    quantityReceived: item.quantityReceived - item.quantityOrdered,
                })
                const product = await Product.findById(item.productId)
                extraItemsTotal += product?.purchasePrice * (item.quantityReceived - item.quantityOrdered)
            }
        })

        if (extraItems.length > 0) {
            const childPurchase = await Purchase.findOne({parentPurchase: purchase._id})
            if (childPurchase) {
                childPurchase.items.push(...extraItems)
                childPurchase.total = childPurchase.total + extraItemsTotal
                await childPurchase.save()
            } else {
            const newPurchase = await Purchase.create({
                    user: purchase.user,
                    items: extraItems,
                    total: extraItemsTotal,
                    status: "received",
                    parentPurchase: purchase._id,
                });
            }
        }

        purchase.status = status
        await purchase.save()
        res.status(200).json(purchase)
    } catch (error) {
        res.status(500).json({ message: 'Error processing purchase' })
    }
})
