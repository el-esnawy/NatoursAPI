const express = require("express");

const tourController = require("../Controllers/tourControllers");
const router = express.Router();

// THE MIDDELWARE ONLY RUNS ON TOUR ROUTES AND NOT ON ANY OTHER ROUTES
router.param("id", tourController.checkID);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTourByID)
  .patch(tourController.updateTourByID)
  .delete(tourController.deleteTourByID);

module.exports = router;
