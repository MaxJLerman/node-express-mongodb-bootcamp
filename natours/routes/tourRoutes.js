const express = require("express");

const tourController = require("../controllers/tourController");

const {
  aliasTopTours,
  getAllTours,
  getOneTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStatistics,
} = tourController;

const router = express.Router(); //* middleware function created

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/tour-statistics").get(getTourStatistics);

//* neither GET (all) or POST requests need an id parameter, so can be chained together like so:
router.route("/").get(getAllTours).post(createTour);

//* rest of the headers do need an id parameter, so can be chained together like so:
router.route("/:id").get(getOneTour).patch(updateTour).delete(deleteTour);

module.exports = router;
