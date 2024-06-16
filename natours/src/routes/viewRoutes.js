const express = require("express");

const viewsController = require("../controllers/viewsController");

const { getOverview, getTour } = viewsController;

const router = express.Router();

router.get("/", getOverview);
router.get("/tour", getTour);

module.exports = router;
