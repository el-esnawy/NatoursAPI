const mongoose = require("mongoose");
const validator = require("validator");
const condenseWhitespace = require("condense-whitespace");
const slugify = require("slugify");

const schemaOfTheTours = {
  name: {
    type: String,
    required: [true, "A Tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "A Tour name must have less or equal to 40 characters"],
    minlength: [10, "A Tour name must have atleast 10 characters"],
    validate: {
      validator: function (value) {
        validator.isAlpha(condenseWhitespace(value), "en-US", {
          ignore: " ",
        });
      },
      message: function (props) {
        return `${props.value} is not a valid tour name`;
      },
    },
  },
  duration: {
    type: Number,
    require: [true, "A Tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A Tour must have a maximum group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A Tour must have a difficulty"],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty is either: easy, medium, difficult",
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, "A Rating must be above 1.0"],
    max: [5, "A Raing must be less than 5.0"],
  },
  ratingsQuantity: { type: Number, default: 0 },
  price: {
    type: Number,
    required: [true, "A Tour must have a price, got {VALUE}"],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (value) {
        // this does not work on update
        return value < this.price;
      },
      message: function (props) {
        return `${props.value} is not a valid price discount`;
      },
    },
  },
  summary: {
    type: String,
    required: [true, "A Tour must have a summary"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, "A Tour must have a cover image"],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
    select: false, // permenantly hide it from the output
  },
  startDates: [Date],
  slug: String,
  secretTour: {
    type: Boolean,
    default: false,
  },
  startLocation: {
    // GeoJSON
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number], // longitude first and latitude second
    address: String,
    description: String,
  },
  locations: [
    {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
  ],
  guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
};

const tourSchema = new mongoose.Schema(schemaOfTheTours, {
  toJSON: {
    virtuals: true,
  },
  toObject: { virtuals: true },
});

// setting an index to speed up query
tourSchema.index({ price: 1, slug: 1 });

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});
//MONGOOSE MIDDLEWARE

// DOCUMENT MIDDLEWARE
// DOCUMENT MIDDLEWARE RUNS BEFORE SAVE COMMAND and .create command but not insertMany
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// embedding the documents
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map((id) => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// eslint-disable-next-line prefer-arrow-callback
tourSchema.post("save", function (doc, next) {
  // console.log(doc); // return current document saved

  next();
});

// QUERY MIDDLEWARE
// eslint-disable-next-line prefer-arrow-callback
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// virtual populate
tourSchema.virtual("reviews", {
  ref: "Reviews",
  foreignField: "tour",
  localField: "_id",
});

// populating all the documents
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query Took ${Date.now() - this.start} ms`);
//   next();
// });

// AGGREGATION MIDDLEWARE
tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
