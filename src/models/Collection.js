const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Collection", collectionSchema);
