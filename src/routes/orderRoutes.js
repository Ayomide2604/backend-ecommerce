const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

// Create an order / checkout

router.post("/checkout", protect, async (req, res) => {
	try {
		const userId = req.user._id;

		// find user cart
		const cart = await Cart.findOne({ user: userId }).populate({
			path: "items",
			populate: {
				path: "product",
				model: "Product",
			},
		});
		if (!cart || cart.items.length === 0) {
			return res.status(400).json({ message: "cart is empty " });
		}

		// Create an order first (but without orderItems yet)
		const order = await Order.create({
			user: userId,
			total: cart.items.reduce(
				(sum, item) => sum + item.product.price * item.quantity,
				0
			),
		});

		// Create order items
		const orderItemsData = cart.items.map((item) => ({
			order: order._id,
			product: item.product._id,
			price: item.product.price,
			quantity: item.quantity,
		}));

		const createdOrderItems = await OrderItem.insertMany(orderItemsData);

		// 🔥 Important: update the order with the created order item IDs
		order.orderItems = createdOrderItems.map((item) => item._id);
		await order.save();

		// clear cart
		cart.items = [];
		await cart.save();

		res
			.status(201)
			.json({ message: "Order Placed Successfully", orderId: order._id });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
});

// Get Orders
router.get("/", protect, async (req, res) => {
	try {
		let orders;
		if (req.user.role === "admin") {
			orders = await Order.find()
				.populate("user", "username firstName lastName email")
				.populate("orderItems");
		} else {
			orders = await Order.find({ user: req.user._id }).populate("orderItems");
		}
		res.status(200).json(orders);
	} catch (error) {
		res.status(500).json({ message: "failed to get orders", error });
	}
});

// Get single order by ID
router.get("/:id", protect, async (req, res) => {
	try {
		const orderId = req.params.id;

		const order = await Order.findById(orderId)
			.populate("user", "username firstName lastName email")
			.populate({
				path: "orderItems",
				populate: {
					path: "product",
					model: "Product",
				},
			});

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Check if user is admin or the owner of the order
		if (
			req.user.role !== "admin" &&
			order.user._id.toString() !== req.user._id.toString()
		) {
			return res
				.status(403)
				.json({ message: "Not authorized to view this order" });
		}

		res.status(200).json(order);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "failed to get order", error });
	}
});

module.exports = router;
