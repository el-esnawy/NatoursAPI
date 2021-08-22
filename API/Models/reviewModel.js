const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchemaOptions = {
  review: {
    type: String,
    required: [true, "A Review must have content"],
  },
  rating: {
    type: Number,
    default: 4.5,
    min: [1, "A Rating must be above 1.0"],
    max: [5, "A Raing must be less than 5.0"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "A Review must belong to a Tour"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A Review must belong to a User"],
  },
};

const reviewSchema = new mongoose.Schema(reviewSchemaOptions, {
  toJSON: {
    virtuals: true,
  },
  toObject: { virtuals: true },
});

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // })
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

// STATIC METHOD TO BE CALLED ON THE MODEL

reviewSchema.statics.calcAvgRatings = async function (tourID) {
  //this points to the current model

  const stats = await this.aggregate([
    { $match: { tour: tourID } },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourID, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating,
  });
};

// post middleware does not get access to next
reviewSchema.post("save", function () {
  //this points to the current document i.e. current review

  // points the model
  this.constructor.calcAvgRatings(this.tour);

  // cant call it on the review before it was created
  // reviewModel.avgRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.reviewQuery = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.reviewQuery.constructor.calcAvgRatings(this.reviewQuery.tour);
});
const reviewModel = mongoose.model("Reviews", reviewSchema);

module.exports = reviewModel;
