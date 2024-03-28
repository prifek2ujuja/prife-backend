import asyncHandler from 'express-async-handler'
import Product from "../models/product/index.js";
import { faker } from "@faker-js/faker"
import { DailyProductReport }  from '../models/report/index.js';

// Create a product document
export const createProduct = asyncHandler(async (req, res) => {
    const { productName: name, productPrice: price, productDescription:description, stock } = req.body
    try {
        const newProduct = await Product.create({
            name,
            price,
            description,
            productImage: faker.image.avatar(),
            stock   
        })
        res.status(201).json(newProduct)
    } catch (error) {
        res.status(500).json({message: "Unable to add document."})
    }
})

// List all products
export const listProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find()
        res.status(201).json(products)
    } catch (error) {
        res.status(500).json({message: "Unable to fetch documents"})
    }
})

// edit a product
export const editProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const data  = req.body
    console.log(data)
    try {
        const updatedProduct = await Product.findOneAndUpdate({
            _id: productId
        }, data)
        // If the sock changes
        if (data.stock !== updatedProduct?.stock) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const productReport = await DailyProductReport.findOne({createdAt: { $gte: today }, product: updatedProduct?._id})
            if (productReport) {
                productReport.addedStock = productReport.addedStock + data.stock;
                await productReport.save()
            } else {
                await DailyProductReport.create({
                    product: updatedProduct?._id,
                    openingStock: updatedProduct?.stock,
                    addedStock: data.stock,
                    sakes: 0,
                })
            }
        }
        res.status(200).json(updatedProduct)
    } catch (error) {
        res.status(500).json({message: "Unable to update document"})
    }
})



// delete a document
export const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    try {
        const product = await Product.findByIdAndDelete(productId)
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({message: "Unable to delete document"})
    }
})

// Get products that are low on stock
export const lowStockProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({stock: { $lte: 15}})
        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({message: "Unable to get products low on stock"})
    }
})

