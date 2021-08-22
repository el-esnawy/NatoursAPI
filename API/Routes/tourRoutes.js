const express = require("express");

const tourController = require("../Controllers/tourController");
const authController = require("../Controllers/authController");

const reivewRouter = require("./reviewRoutes");

const router = express.Router();

// THE MIDDELWARE ONLY RUNS ON TOUR ROUTES AND NOT ON ANY OTHER ROUTES
// router.param("id", tourController.checkID);

router.use("/:tourId/reviews", reivewRouter);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.authorize("admin", "lead-guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTourByID)
  .patch(
    authController.protect,
    authController.authorize("admin", "lead-guide"),
    tourController.updateTourById
  )
  .delete(
    authController.protect,
    authController.authorize("admin", "lead-guide"),
    tourController.deleteTourByID
  );

module.exports = router;
