const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../utils/validationSchemas");

// Getlist of users
router.get("/auth/users", async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json(users);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Error Fetching Products", error: error.message });
	}
});

// Get a single product by Id
router.get("/auth/users/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).send("No Product found with that ID");
		}
		res.json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Register a new user
router.post("/auth/register", validateUser, async (req, res) => {
	const { username, email, password, firstName, lastName } = req.body;
	try {
		if (await User.findOne({ email }))
			return res
				.status(400)
				.json({ message: "User with that email already exists" });

		if (await User.findOne({ username }))
			return res
				.status(400)
				.json({ message: "User with that Username already exists" });

		const user = await User.create({
			username,
			email,
			password,
			firstName,
			lastName,
		});
		res
			.status(201)
			.json({ message: "User Registered Successfully", user: user });
	} catch (err) {
		res.status(500).json({ message: "User Registration Failed", err });
	}
});

// Login a user

router.post("/auth/login", async (req, res) => {
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
					role: user.role,
					firstName: user.firstName,
					lastName: user.lastName,
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
