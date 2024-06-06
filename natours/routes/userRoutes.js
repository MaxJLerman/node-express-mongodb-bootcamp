const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const {
  getAllUsers,
  updateCurrentUser,
  getOneUser,
  createUser,
  updateUser,
  deleteUser,
} = userController;
const {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} = authController;

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-password", protect, updatePassword);
router.patch("/update-current-user", protect, updateCurrentUser);

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getOneUser).patch(updateUser).delete(deleteUser);

module.exports = router;
