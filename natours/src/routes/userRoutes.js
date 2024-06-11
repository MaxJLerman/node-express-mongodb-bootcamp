const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const {
  getAllUsers,
  updateCurrentUser,
  deleteCurrentUser,
  getCurrentUser,
  getOneUser,
  createUser,
  updateUser,
  deleteUser,
} = userController;
const {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = authController;

const router = express.Router(); //* mini application, runs middleware in sequence

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

router.use(protect); //* protects all subsequent routes

router.patch("/update-password", /* protect, */ updatePassword); //* protect is middleware, can be run as above
router.get("/current-user", getCurrentUser, getOneUser);
router.patch("/update-current-user", updateCurrentUser);
router.delete("/delete-current-user", deleteCurrentUser);

router.use(restrictTo("admin")); //* restrict further subsequent routes to admin

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getOneUser).patch(updateUser).delete(deleteUser);

module.exports = router;
