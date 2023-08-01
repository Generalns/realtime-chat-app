const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// Register route
router.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const { username, phoneNumber, password } = req.body;

    // Check if the required fields are provided
    if (!username || !phoneNumber || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the user already exists
    const existingUser = await User.getUserByPhoneNumber(phoneNumber);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }

    // Create the user and store it in the database
    const userId = await User.createUser(username, phoneNumber, password);
    res.status(201).json({ message: "User registered successfully.", userId });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user." });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Check if the required fields are provided
    if (!phoneNumber || !password) {
      return res
        .status(400)
        .json({ error: "Phone number and password are required." });
    }

    // Fetch the user by phone number from the database
    const user = await User.getUserByPhoneNumber(phoneNumber);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify the password
    const isPasswordValid = User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password." });
    }

    // At this point, the user is authenticated successfully
    // Create a token for the user
    const token = jwt.sign({ id: user.id }, "bebeaspirini", {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful.",
      userId: user.id,
      token: token,
      user: user.username,
      phoneNumber: user.phoneNumber,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to log in." });
  }
});

router.get("/:phoneNumber", async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;

    // Check if the required fields are provided
    if (!phoneNumber) {
      console.log("empty", userId);
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the user already exists
    const user = await User.getUserByPhoneNumber(phoneNumber);

    if (user) {
      return res.status(200).json({
        userId: user.id,
        user: user.username,
        phoneNumber: user.phoneNumber,
      });
    }

    // Create the user and store it in the database
  } catch (err) {
    res.status(500).json({ error: "Failed to register user." });
  }
});

module.exports = router;
