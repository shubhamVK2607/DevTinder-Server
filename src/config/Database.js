const mongoose = require("mongoose");

const connectDB = mongoose.connect(
  "mongodb+srv://shubham3034:singh123@nodejs-learning.x3xzw.mongodb.net/devTinder"
);

module.exports = connectDB;
