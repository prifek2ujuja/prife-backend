import asyncHandler from "express-async-handler";
import Product from "../models/product/index.js";
import { faker } from "@faker-js/faker";
import { DailyProductReport } from "../models/report/index.js";
import Image from "../models/image/index.js";

// Create a product document
export const createProduct = asyncHandler(async (req, res) => {
  const {
    productName: name,
    productPrice: price,
    productDescription: description,
    stock,
    imageUrl,
    imagePath,
  } = req.body;
  try {
    const productImage = await Image.create({
      imagePath,
      imageUrl,
    });
    const newProduct = await Product.create({
      name,
      price,
      description,
      productImage: faker.image.avatar(),
      stock,
      productImages: [productImage],
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Unable to add document." });
  }
});

// List all products
export const listProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find();
    res.status(201).json(products);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch documents" });
  }
});

// edit a product
export const editProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = req.body;
  try {
    // const updatedProduct = await Product.findOneAndUpdate({
    //     _id: productId
    // }, data)
    const updatedProduct = await Product.findByIdAndUpdate(productId, data, {
      new: true,
    });
    // If the only sock changes
    if (data.stock && !data.name) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const productReport = await DailyProductReport.findOne({
        createdAt: { $gte: today },
        product: updatedProduct?._id,
      });
      if (productReport) {
        productReport.addedStock = productReport.addedStock + data.stock;
        await productReport.save();
      } else {
        await DailyProductReport.create({
          product: updatedProduct?._id,
          openingStock: updatedProduct?.stock,
          addedStock: data.stock,
          sakes: 0,
        });
      }
    }
    // await updatedProduct?.save()
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Unable to update document" });
  }
});

export const editProductStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { stock, action } = req.body;
  console.log("stock: ", stock);
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (action === "add") {
      const updatedProduct = await Product.findByIdAndUpdate(productId, {
        $inc: { stock: parseInt(stock) },
      });
      const updatedDailyProductReport =
        await DailyProductReport.findOneAndUpdate(
          {
            createdAt: { $gte: today },
            product: productId,
          },
          { $inc: { addedStock: parseInt(stock) } },
          { upsert: true }
        );
      if (!updatedDailyProductReport) {
        await DailyProductReport.create({
          product: productId,
          openingStock: updatedProduct?.stock,
          addedStock: parseInt(stock),
          removedStock: 0,
          sales: 0,
        });
      }
    } else {
      const updatedProduct = await Product.findByIdAndUpdate(productId, {
        $dec: { stock: parseInt(stock) },
      });
      const updatedDailyProductReport =
        await DailyProductReport.findOneAndUpdate(
          {
            createdAt: { $gte: today },
            product: productId,
          },
          { $inc: { removedStock: parseInt(stock) } },
          { upsert: true }
        );
      if (!updatedDailyProductReport) {
        await DailyProductReport.create({
          product: productId,
          openingStock: updatedProduct?.stock,
          addedStock: 0,
          removedStock: parseInt(stock),
          sales: 0,
        });
      }
    }
    res.status(200).json({ message: "Stock updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to update stock" });
  }
});

// delete a document
export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findByIdAndDelete(productId);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Unable to delete document" });
  }
});

// Get products that are low on stock
export const lowStockProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lte: 15 } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Unable to get products low on stock" });
  }
});

export const getProductImages = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId)
      .populate("productImages")
      .select("productImages");
    res.status(200).json(product?.productImages);
  } catch (error) {
    res.status(500).json({ message: "Unable to get product images" });
  }
});

export const getTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ likes: 1 }).limit(4);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Unable to get top product" });
  }
});

export const addLike = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  try {
    await Product.findByIdAndUpdate(productId, {
      $inc: {
        likes: 1,
      },
    });
    res.status(200).json({ message: "Added product likes" });
  } catch (error) {
    res.status(500).json({ message: "Unable to add product likes" });
  }
});
