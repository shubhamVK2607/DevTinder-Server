const { default: mongoose } = require("mongoose");
const User = require("./user");

const { Schema } = mongoose;

const chatSchema = new Schema(
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
    message: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ fromUserId: 1, toUserId: 1 });

const Chats = mongoose.model("chat", chatSchema);

Chats.init();

module.exports = Chats;
