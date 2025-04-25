const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, cartController.getCart);
router.post("/add", protect, cartController.addToCart);
router.delete("/remove/:itemId", protect, cartController.removeFromCart);
router.patch("/item/:itemId", protect, cartController.updateCartItem);

router.patch(
	"/item/:itemId/increase",
	protect,
	cartController.increaseQuantity
);

router.patch(
	"/item/:itemId/decrease",
	protect,
	cartController.decreaseQuantity
);

module.exports = router;
