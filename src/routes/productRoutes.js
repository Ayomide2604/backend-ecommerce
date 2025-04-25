const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const Product = require("../models/Product");
const { validateProduct } = require("../utils/validationSchemas");
const { protect, adminOnly } = require("../middleware/authMiddleware");

//image storage configuration
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });

// Get all Products
router.get("/", async (req, res) => {
	try {
		const products = await Product.find().populate("collection");
		res.status(200).json(products);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error Fetching Products", error: error.message });
	}
});

// Get a single product by Id
router.get("/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate(
			"collection"
		);
		if (!product) {
			return res.status(404).send("No Product found with that ID");
		}
		res.json(product);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Create a new Product
router.post("/", validateProduct, upload.single("image"), async (req, res) => {
	const { name, description, price, collection } = req.body;
	const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

	try {
		const product = await Product.create({
			name,
			description,
			price,
			collection,
			image: imagePath,
		});
		res.status(201).json(product);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error Creating Product", error: error.message });
	}
});

//  Update Product
router.put(
	"/:id",
	validateProduct,
	upload.single("image"),
	async (req, res) => {
		const { name, price, description, image, collection } = req.body;
		const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
		try {
			const product = await Product.findById(req.params.id).populate(
				"collection"
			);
			if (!product)
				return res.status(404).send("No Product Found with that ID");
			product.name = name;
			product.price = price;
			product.description = description;
			product.image = imagePath;
			product.collection = collection;
			await product.save();
			res.status(200).json(product);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Delete Product
router.delete("/:id", async (req, res) => {
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
