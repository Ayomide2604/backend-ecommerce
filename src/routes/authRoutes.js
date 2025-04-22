const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../utils/validationSchemas");

// Register a new user
router.post("/register", validateUser, async (req, res) => {
	const { username, email, password } = req.body;
	try {
		if (await User.findOne({ email }))
			return res
				.status(400)
				.json({ message: "User with that email already exists" });

		if (await User.findOne({ username }))
			return res
				.status(400)
				.json({ message: "User with that Username already exists" });

		const user = await User.create({ username, email, password });
		res
			.status(201)
			.json({ message: "User Registered Successfully", user: user });
	} catch (err) {
		res.status(500).json({ message: "User Registration Failed", err });
	}
});

// Login a user

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (user && (await user.matchPassword(password))) {
			const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
				expiresIn: "1h",
			});

			res.json({
				token,
				user: {
					id: user._id,
					email: user.email,
					username: user.username,
				},
			});
		} else {
			res.status(401).json({ message: "Invalid email or password" });
		}
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;
