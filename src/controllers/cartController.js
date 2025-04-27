const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");

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
			return res.status(404).json({ message: "Cart is empty", items: [] });
		}

		let totalPrice = 0;

		const itemsWithSubTotal = cart.items.map((item) => {
			const subTotal = item.product.price * item.quantity;
			totalPrice += subTotal;
			return {
				_id: item.id,
				product: item.product,
				quantity: item.quantity,
				subTotal,
			};
		});

		res
			.status(200)
			.json({ cartId: cart._id, items: itemsWithSubTotal, totalPrice });
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

		let item = cart.items.find((item) => item.product.toString() === productId);

		const qty = quantity || 1;

		if (item) {
			item.quantity += qty;
			await item.save();
		} else {
			const newItem = new CartItem({
				product: productId,
				quantity: qty,
			});

			await newItem.save();
			cart.items.push(newItem);
		}
		await cart.save();
		res.status(200).json({ message: "Item Added to Cart", cart });
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

// Increment quantity by 1
exports.increaseQuantity = async (req, res) => {
	const { itemId } = req.params;

	try {
		const item = await CartItem.findById(itemId).populate("product");
		if (!item) return res.status(404).json({ error: "Item not found" });

		item.quantity += 1;
		await item.save();
 
		const subtotal = item.product.price * item.quantity;

		res.status(200).json({ message: "Quantity increased", item, subtotal });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Decrease quanitity by 1
exports.decreaseQuantity = async (req, res) => {
	const { itemId } = req.params;

	try {
		const item = await CartItem.findById(itemId).populate("product");
		if (!item) return res.status(404).json({ error: "Item not found" });

		if (item.quantity <= 1) {
			await item.deleteOne();
			return res.status(200).json({ message: "Item removed from cart" });
		}

		item.quantity -= 1;
		await item.save();

		res.status(200).json({ message: "Quantity decreased", item });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.updateCartItem = async (req, res) => {
	const { itemId } = req.params;
	const { quantity } = req.body;

	try {
		const item = await CartItem.findById(itemId).populate("product");
		if (!item) return res.status(404).json({ error: "Item not found" });

		if (quantity < 1) {
			await item.remove();
			return res.status(200).json({ message: "Item removed from cart" });
		}

		item.quantity = quantity;
		await item.save();

		const subtotal = item.product.price * item.quantity;

		res.status(200).json({ message: "Quantity updated", item, subtotal });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
