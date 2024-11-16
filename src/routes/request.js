const express = require("express");
const authMiddleware = require("../middleware/auth");
const ConnectionRequest = require("../models/request");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  authMiddleware,
  async (req, res) => {
    try {
      const allowedStatus = ["interested", "ignored"];
      const status = req.params.status;
      const isStatusAllowed = allowedStatus.includes(status);

      if (!isStatusAllowed) {
        throw new Error("Invalid Status type: " + status);
      }

      const toUserId = req.params.toUserId;
      const fromUserId = req.user._id;

      const toUser = await User.findById(toUserId);

      if (!toUser) {
        throw new Error("User is not in DB : " + toUserId);
      }

      const savedConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (savedConnectionRequest) {
        throw new Error("Request are already there to or from : " + toUserId);
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      const message =
        status === "interested"
          ? `${req?.user?.firstName} is ${status} in ${toUser.firstName}`
          : `${req?.user?.firstName} ${status} ${toUser.firstName}`;
      res.status(200).json({ message, data });
    } catch (error) {
      res.status(400).send("Error : " + error.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestedId",
  authMiddleware,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { requestedId, status } = req.params;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid status type " + status);
      }

      const requestedConnectionRequest = await ConnectionRequest.findOne({
        _id: requestedId,
      });

      if (requestedConnectionRequest) {
        if (
          requestedConnectionRequest.toUserId === loggedInUser._id ||
          requestedConnectionRequest.status === "interested"
        ) {
          requestedConnectionRequest.status = status;

          await requestedConnectionRequest.save();
          res.json({
            message: `connection request ${status} successfully`,
            data: requestedConnectionRequest,
          });
        } else {
          throw new Error("You don't have any pending connection request");
        }
      } else {
        throw new Error("No connection request found ", requestedId);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);
module.exports = requestRouter;
