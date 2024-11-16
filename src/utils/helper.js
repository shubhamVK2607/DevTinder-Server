const validator = require("validator");

const validateSignUp = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("firstName or lastName cannot be empty");
  } else if (!validator.isEmail(email)) {
    throw new Error("Please Enter a valid Email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Your password is too week");
  }
};

const validateEditProfile = (req) => {
  const requestedEditFields = req.body;
  const allowedEditFields = [
    "firstName",
    "lastName",
    "email",
    "age",
    "gender",
    "photoURL",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(requestedEditFields).every((item) =>
    allowedEditFields.includes(item)
  );

  return isEditAllowed;
};

const validateEditPassword = (req) => {
  if (!req.body.password) {
    throw new Error("Password fields cannot be empty");
  }
  const requestedEditFields = Object.keys(req.body);

  const newPassword = req.body.password;

  if (
    !(requestedEditFields.length === 1) ||
    !(requestedEditFields[0] === "password")
  ) {
    throw new Error("Only password fields are allowed");
  }

  const isEditAllowed = validator.isStrongPassword(newPassword);

  return isEditAllowed;
};

module.exports = {
  validateSignUp,
  validateEditProfile,
  validateEditPassword,
};
