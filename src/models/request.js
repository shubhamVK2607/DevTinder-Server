const { Mongoose, default: mongoose } = require("mongoose");
const User = require("./user");

const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: User,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: User,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "${VALUE} is not from status type",
      },
      require: true,
    },
  },

  {
    timestamps: true,
  }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;

  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself");
  }
  next();
});

const ConnectionRequests = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

ConnectionRequests.init();

module.exports = ConnectionRequests;
