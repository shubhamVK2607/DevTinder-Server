const express = require("express");
const authMiddleware = require("../middleware/auth");
const Chats = require("../models/chat");
const User = require("../models/user");
const ConnectionRequests = require("../models/request");

const chatRouter = express.Router();

chatRouter.post("/chats/send/:toUserId", authMiddleware, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId } = req.params;
    const message = req.body.message;

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      throw new Error("User doesn't exist in DB");
    }

    if (fromUserId.toString() === toUserId) {
      throw new Error("Cannot send message to yourself");
    }

    const connectionStatus = await ConnectionRequests.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (!connectionStatus || connectionStatus.status !== "accepted") {
      throw new Error("You are not connected");
    }

    const chat = new Chats({
      fromUserId,
      toUserId,
      message,
    });

    await chat.save();

    res.send("Message send successfully");
  } catch (error) {
    res.send("ERROR : " + error.message);
  }
});

chatRouter.get("/chats/:toUserId", authMiddleware, async (req, res) => {
  try {
    const fromUserId = req.user._id;

    const toUserId = req.params.toUserId;
    const chatHistory = await Chats.find({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    })
      .populate("fromUserId", "photoURL")
      .populate("toUserId", "photoURL")
      .sort({ createdAt: 1 });

    res.json({ message: "chats fetched successfully", data: chatHistory });
  } catch (error) {
    res.send("ERROR :" + error.message);
  }
});

module.exports = chatRouter;
