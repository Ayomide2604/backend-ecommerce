const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
	title: {
		tyoe: String,
		required: true,
		enum: [],
	},
});

module.exports = mongoose.model("Collection", collectionSchema);
