const express = require("express");
const cors = require("cors");
const connectDB = require("../config/db");
const orderController = require("../controllers/orderController");
const orderRoutes = require("../routes/orderRoutes");
const userRoutes = require("../routes/userRoutes");
const adminRoutes = require("../routes/adminRoutes.js")
const auth = require("../middleware/auth.js")
const adminAuth = require("../middleware/adminAuth.js")

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.post(
    "/api/orders/placeOrder",
    orderController.upload.single("document"),
    orderController.placeOrder
  );

// Routes
app.use("/api/orders", auth,orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin",/*adminAuth,*/ adminRoutes);

// Default route
app.get("/",(req, res) => res.json({ message: "VENTTUP server" }));



//temporary for development - to seed users in the database
// hit node seed.js to seed the temporary users before starting the server

// Start server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
