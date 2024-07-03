import express from "express";

import {
  getAllUsers,
  updateCurrentUser,
  deleteCurrentUser,
  getCurrentUser,
  getOneUser,
  createUser,
  updateUser,
  deleteUser,
} from "@controllers/userController";
import {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "@controllers/authController";

const userRouter = express.Router(); //* mini application, runs middleware in sequence

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/forgot-password", forgotPassword);
userRouter.patch("/reset-password/:token", resetPassword);

userRouter.use(protect); //* protects all subsequent routes

userRouter.patch("/update-password", /* protect, */ updatePassword); //* protect is middleware, can be run as above
userRouter.get("/current-user", getCurrentUser, getOneUser);
userRouter.patch("/update-current-user", updateCurrentUser);
userRouter.delete("/delete-current-user", deleteCurrentUser);

userRouter.use(restrictTo("admin")); //* restrict further subsequent routes to admin

userRouter.route("/").get(getAllUsers).post(createUser);
userRouter.route("/:id").get(getOneUser).patch(updateUser).delete(deleteUser);

export default userRouter;
