const express = require("express");
const authMiddleware = require("../middleware/auth");

const ConnectionRequests = require("../models/request");
const User = require("../models/user");

const userRouter = express.Router();

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "age",
  "photoURL",
  "skills",
  "about",
];

userRouter.get("/user/requests/received", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const requests = await ConnectionRequests.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.status(200).json({
      message: "connection requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

userRouter.get("/user/connections", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectedUser = await ConnectionRequests.find({
      status: "accepted",
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectedUser.map((row) =>
      row.fromUserId._id.toString() === loggedInUser._id.toString()
        ? row.toUserId
        : row.fromUserId
    );

    res.status(200).json({
      message: "data fetched successfully",
      data: { length: data.length, data },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

userRouter.get("/user/feed", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    limit = limit > 50 ? 50 : limit;

    const connectedUsers = await ConnectionRequests.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
      .select(["fromUserId", "toUserId"])
      .populate("fromUserId", "firstName")
      .populate("toUserId", "firstName");

    const hiddenUsersFromFeedId = connectedUsers.flatMap((connection) => [
      connection.fromUserId._id.toString(),
      connection.toUserId._id.toString(),
    ]);

    const hiddenUsersFromFeedId_unique = Array.from(
      new Set(hiddenUsersFromFeedId)
    );

    const allowedUsersOnFeed = await User.find({
      $and: [
        { _id: { $nin: hiddenUsersFromFeedId_unique } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "data fetched successfully",
      data: { length: allowedUsersOnFeed.length, data: allowedUsersOnFeed },
    });
  } catch (error) {
    res.status(400).json({ Error: error.message });
  }
});
module.exports = userRouter;
