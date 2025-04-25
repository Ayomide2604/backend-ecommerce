const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const cartRoutes = require("./routes/cartRoutes");

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(
	cors({
		origin: ["http://localhost:5173"],
		methods: "GET, POST, PUT, PATCH, DELETE",
		allowedHeaders: "Content-Type, Authorization",
	})
);

// Routes
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/cart", cartRoutes);
app.listen(PORT, () => console.log("Server is running on port" + PORT));
