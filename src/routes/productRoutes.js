const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { validateProduct } = require("../utils/validationSchemas");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Create a new Product
router.post("/", protect, adminOnly, validateProduct, async (req, res) => {
	const { name, description, price, collection, image } = req.body;

	try {
		const product = await Product.create({
			name,
			description,
			price,
			collection,
			image,
		});
		res.status(201).json(product);
	} catch (error) {
		console.error(error); // Log the error for debugging
		res
			.status(500)
			.json({ message: "Error Creating Product", error: error.message });
	}
});

// Get all Products
router.get("/", async (req, res) => {
	try {
		const products = await Product.find();
		res.status(200).json(products);
	} catch (error) {
		console.error(error); // Log the error for debugging
		res
			.status(500)
			.json({ message: "Error Fetching Products", error: error.message });
	}
});

// Get a single product by Id
router.get("/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) {
			return res.status(404).send("No Product found with that ID");
		}
		res.json(product);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

//  Update Product
router.put("/:id", protect, adminOnly, validateProduct, async (req, res) => {
	const { name, price, description } = req.body;
	try {
		const product = await Product.findById(req.params.id);
		if (!product) return res.status(404).send("No Product FOund with that ID");
		product.name = name;
		product.price = price;
		product.description = description;
		await product.save();
		res.status(200).json(product);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Delete Product
router.delete("/:id", protect, adminOnly, async (req, res) => {
	const { id } = req.params;

	try {
		const product = await Product.findByIdAndDelete(id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		res.status(204).send("Product Deleted Successfully");
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error Deleting Product", error: error.message });
	}
});

module.exports = router;
