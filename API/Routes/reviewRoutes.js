const express = require("express");

const reviewController = require("../Controllers/reviewController");
const authController = require("../Controllers/authController");

const router = express.Router({
  mergeParams: true,
});

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.authorize("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router.use(authController.authorize("user", "admin"));
router
  .route("/:id")
  .delete(reviewController.deleteReviewById)
  .get(reviewController.getReview);

module.exports = router;
