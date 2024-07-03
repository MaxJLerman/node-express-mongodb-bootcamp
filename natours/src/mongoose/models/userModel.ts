import { Model, Query, Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { IUser, IUserMethods, UserModel } from "@schemas/user.schema";

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
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
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
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
      validator: function (this: IUser, element: string) {
        return element === this.password;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//* runs between getting the data and saving to the database
userSchema.pre<IUser>("save", async function (next) {
  //* only runs if password has NOT been modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password as string, 12); //? 12 = cost to CPU, default is 10
  this.confirmPassword = undefined; //? don't persist confirmPassword to database

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);

  next();
});

userSchema.pre<Query<IUser, IUser>>(/^find/, function (next) {
  //? filters out documents that either have an "active" property set to false or don't have an "active" property at all
  this.find({ active: { $ne: false } });

  next();
});

//* instance method, available on all documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp: number) {
  if (this["passwordChangedAt"]) {
    const changedTimestamp = this["passwordChangedAt"].getTime() / 1000;
    return jwtTimestamp < changedTimestamp;
  }

  return false; //? password NOT changed
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this["passwordResetToken"] = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this["passwordResetToken"]);

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

const User: Model<IUser> = model("User", userSchema);

export default User;
