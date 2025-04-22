const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: String,
		price: {
			type: Number,
			required: true,
		},
		image: String,
		collection: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Collection",
		},
	},
	{ timestamps: true }
);



module.exports = mongoose.model("Product", productSchema);
