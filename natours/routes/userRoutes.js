const express = require("express");

const userController = require("../controllers/userController");

const { getAllUsers, getOneUser, createUser, updateUser, deleteUser } =
  userController;

const router = express.Router();

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getOneUser).patch(updateUser).delete(deleteUser);

module.exports = router;
