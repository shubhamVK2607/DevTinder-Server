const User = require("../models/user");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const authMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please Login");
    }
    const decodedUser = jwt.verify(token, "ShubhamWillEarn@24LPAverysoon");
    const user = await User.findById(decodedUser._id);

    if (!user) {
      throw new Error("No User found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = authMiddleware;
