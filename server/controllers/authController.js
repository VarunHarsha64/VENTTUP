const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const UnverifiedUser = require("../models/UnverifiedUser");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // You should set JWT_SECRET in your .env file

// Login function
const login = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    // Check if the user is in the UnverifiedUsers collection
    const unverifiedUser = await UnverifiedUser.findOne({ username });
    if (unverifiedUser) {
      // If user exists in the unverified list, send a message to contact admin
      const isMatch = await bcrypt.compare(password, unverifiedUser.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      return res.status(203).json({
        message:
          "User registration has not been verified by the admin yet. Kindly contact admin or wait.",
      });
    }

    // If the user is not unverified, find the user in the verified User collection
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const register = async (req, res) => {
  const { businessName, username, password, phoneNo, role, address } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to the database
    await UnverifiedUser.create({
      businessName: businessName,
      username: username,
      password: hashedPassword,
      phoneNo: phoneNo,
      role: role,
      address: address,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login };
