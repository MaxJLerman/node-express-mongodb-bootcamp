const express = require("express");

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const { getAllUsers, getOneUser, createUser, updateUser, deleteUser } =
  userController;

const router = express.Router();

router.post("/signup", authController.signup);

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getOneUser).patch(updateUser).delete(deleteUser);

module.exports = router;
