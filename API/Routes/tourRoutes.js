const express = require("express");

const tourController = require("../Controllers/tourController");
const authController = require("../Controllers/authController");

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
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTourByID)
  .patch(tourController.updateTourByID)
  .delete(
    authController.protect,
    authController.authorize("admin", "lead-guide"),
    tourController.deleteTourByID
  );

module.exports = router;
