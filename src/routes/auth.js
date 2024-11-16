const express = require("express");

const authRouter = express.Router();
const { validateSignUp } = require("../utils/helper");
const User = require("../models/user");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUp(req);
    const { firstName, lastName, email, password, age, photoURL, about } =
      req.body;
    const bcryptedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      age,
      email,
      password: bcryptedPassword,
      photoURL,
      about,
    });

    await user.save();
    res.send("User added successfully...");
  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.passwordValidate(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token);

      res.json(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token");

  res.send("User logout successfully");
});

module.exports = authRouter;
