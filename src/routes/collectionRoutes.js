const express = require("express");
const router = express.Router();
const Collection = require("../models/Collection");
const { validateCollection } = require("../utils/validationSchemas");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Get all Collections
router.get("/", async (req, res) => {
	try {
		const collections = await Collection.find();
		if (!collections)
			return res.status(404).json({ message: "No collections found" });
		res.status(200).json(collections);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error retrieving collections", error: error.message });
	}
});

//  Get a single Collection
router.get("/:id", async (req, res) => {
	try {
		const collection = await Collection.findById(req.params.id);
		if (!collection) {
			return res.status(404).send("No Collection found with that ID");
		}
		res.json(collection);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

//  Create a new Collection

router.post("/", validateCollection, async (req, res) => {
	const { title } = req.body;

	try {
		const collection = await Collection.create({ title });
		res
			.status(201)
			.json({ message: "Collection created successfully", collection });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error Creating Collection", error: error.message });
	}
});

//  Update Collection
router.put("/:id", validateCollection, async (req, res) => {
	const { title } = req.body;
	try {
		const collection = await Collection.findById(req.params.id);
		if (!collection)
			return res.status(404).send("No Collection Found with that ID");
		collection.title = title;

		await collection.save();
		res.status(200).json(collection);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

//  Delete Collection
router.delete("/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const collection = await Collection.findByIdAndDelete(id);
		if (!collection) {
			return res.status(404).json({ message: "Collection not found" });
		}
		res.status(204).send("Collection Deleted Successfully");
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error Deleting Collection", error: error.message });
	}
});

module.exports = router;
