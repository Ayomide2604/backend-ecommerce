const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(
	cors({
		origin: ["https://localhost:5173"],
		methods: "GET, POST, PUT, PATCH, DELETE",
		allowedHeaders: "Content-Type, Authorization",
	})
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.listen(PORT, () => console.log("Server is running on port" + PORT));
