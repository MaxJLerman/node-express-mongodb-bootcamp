const express = require("express");

const tourController = require("../controllers/tourController");

const {
  checkId,
  checkBody,
  getAllTours,
  getOneTour,
  createTour,
  updateTour,
  deleteTour,
} = tourController;

const router = express.Router(); //* middleware function created

router.param("id", checkId);

//* neither GET (all) or POST requests need an id parameter, so can be chained together like so:
router.route("/").get(getAllTours).post(checkBody, createTour);

//* rest of the headers do need an id parameter, so can be chained together like so:
router.route("/:id").get(getOneTour).patch(updateTour).delete(deleteTour);

module.exports = router;
