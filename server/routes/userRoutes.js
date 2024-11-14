const express = require("express");
const router = express.Router();
const {
  unverifiedList,
  fetchVendors,
  chooseVendor,
  verifyUser,
  createVendor,
} = require("../controllers/userController");
const { login, register } = require("../controllers/authController");

router.get("/unverifiedList", unverifiedList);
router.post("/login", login);
router.post("/verifyUser", verifyUser);
router.post("/register" , register);
router.get("/fetchVendors", fetchVendors);
router.post("/chooseVendor", chooseVendor);
router.post("/createVendor", createVendor);

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(403).send("Token is required");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user; // Set the user from the token payload
    next();
  });
};

// test route to verify token

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
router.get("/verify-token", verifyToken, (req, res) => {
  res.json({
    token: req.headers["authorization"]?.split(" ")[1],
    role: req.user.role,
  }); // Send back user details
});

module.exports = router;
