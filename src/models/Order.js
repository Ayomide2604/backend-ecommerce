const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		orderItems: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "OrderItem",
				required: true,
			},
		],
		total: { type: Number, required: true },
		status: {
			type: String,
			enum: ["pending", "successful", "completed"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
