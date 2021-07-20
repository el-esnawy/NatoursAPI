const express = require("express");

const tourController = require("../Controllers/tourController");

const router = express.Router();

// THE MIDDELWARE ONLY RUNS ON TOUR ROUTES AND NOT ON ANY OTHER ROUTES
// router.param("id", tourController.checkID);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTourByID)
  .patch(tourController.updateTourByID)
  .delete(tourController.deleteTourByID);

module.exports = router;
