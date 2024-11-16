const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error("Not a valid Email");
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value))
          throw new Error("Password is too week");
      },
    },
    age: { type: Number, min: 18 },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value))
          throw new Error("Invalid gender");
      },
    },
    skills: {
      type: [String],
    },
    about: {
      type: String,
      default: "This is a default about section",
    },
    photoURL: {
      type: String,
      default:
        "https://media.licdn.com/dms/image/v2/D4D03AQEpOqKDgU8E2Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1682776545065?e=1735776000&v=beta&t=HgeGY0jkRdrh4JXgpNL3dl3NCjWTwReIi5HBPuZeLRI",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign(
    { _id: user._id },
    "ShubhamWillEarn@24LPAverysoon",
    { expiresIn: "1d" }
  );

  return token;
};

userSchema.methods.passwordValidate = async function (userEnteredPassword) {
  const user = this;
  const passwordHashed = user.password;
  const isPasswordValid = await bcrypt.compare(
    userEnteredPassword,
    passwordHashed
  );

  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
User.init();

module.exports = User;
