const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
  },
  email: {
    type: String,
    required: [true, "A user must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "A user must have a password"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "A user must confirm their password"],
    validate: {
      //! this only works on CREATE or SAVE
      validator: function (element) {
        return element === this.password;
      },
      message: "Passwords do not match",
    },
  },
});

//* runs between getting the data and saving to the database
userSchema.pre("save", async function (next) {
  //* only runs if password has NOT been modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12); //? 12 = cost to CPU, default is 10
  this.confirmPassword = undefined; //? don't persist confirmPassword to database

  next();
});

//* instance method, available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
