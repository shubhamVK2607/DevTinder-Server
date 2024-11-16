const express = require("express");

const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/auth");
const {
  validateEditProfile,
  validateEditPassword,
} = require("../utils/helper");

profileRouter.get("/profile/view", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Error getting the profile " + err.message);
  }
});

profileRouter.patch("/profile/edit", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const isEditAllowed = validateEditProfile(req);

    if (!isEditAllowed) {
      throw new Error("Edit not allowed");
    } else {
      Object.keys(req.body).forEach(
        (key) => (loggedInUser[key] = req.body[key])
      );

      await loggedInUser.save();
      res.status(201).json({
        message: `${req.user.firstName}! your profile updated successfully`,
        data: loggedInUser,
      });
    }
  } catch (err) {
    res.status(400).send("Error while updating the profile " + err.message);
  }
});

profileRouter.patch("/profile/password", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const newPassword = req.body.password;
    const isEditAllowed = validateEditPassword(req);

    if (!isEditAllowed) {
      throw new Error("Your password is not strong enough");
    } else {
      const bcryptedNewPassword = await bcrypt.hash(newPassword, 10);

      loggedInUser.password = bcryptedNewPassword;
      await loggedInUser.save();
      res.clearCookie("token").send("Password Updated Successfully");
    }
  } catch (err) {
    res.status(400).send("Error while updating the password " + err.message);
  }
});

module.exports = profileRouter;
