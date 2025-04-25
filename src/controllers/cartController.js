const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

// View cart
exports.getCart = async (req, res) => {
	const userId = req.user.id;

	try {
		const cart = await Cart.findOne({ user: userId }).populate({
			path: "items",
			populate: {
				path: "product",
				model: "Product",
			},
		});

		if (!cart) {
			return res.status(200).json({ message: "Cart is empty", items: [] });
		}

		res.status(200).json({ cart });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
// Add item to Cart

exports.addToCart = async (req, res) => {
	const { productId, quantity } = req.body;
	const userId = req.user._id;

	try {
		let cart = await Cart.findOne({ user: userId }).populate("items");
		if (!cart) {
			cart = new Cart({ user: userId, items: [] });
		}
		let item = cart.items.find(
			(item) => item.product._id.toString() === productId
		);
		if (item) {
			item.quantity += quantity || 1;
			await item.save();
		} else {
			const newItem = new CartItem({
				product: productId,
				quantity: quantity || 1,
			});

			await newItem.save();
			cart.items.push(newItem);
		}
		await cart.save();
		res.status(200).json({ message: "Item Added to Cart ", cart });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
	const { itemId } = req.params;
	const userId = req.user.id;

	try {
		const cart = await Cart.findOne({ user: userId });
		if (!cart) return res.status(404).json({ error: "Cart not found" });

		cart.items.pull(itemId);
		await cart.save();
		await CartItem.findByIdAndDelete(itemId);

		res.status(200).json({ message: "Item removed from cart" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Update quantity
exports.updateCartItem = async (req, res) => {
	const { itemId } = req.params;
	const { quantity } = req.body;

	try {
		const item = await CartItem.findById(itemId);
		if (!item) return res.status(404).json({ error: "Item not found" });

		item.quantity = quantity;
		await item.save();

		res.status(200).json({ message: "Item updated", item });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
