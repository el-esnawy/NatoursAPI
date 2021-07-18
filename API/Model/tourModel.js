const mongoose = require("mongoose");

const schemaOfTheTours = {
  name: {
    type: String,
    required: [true, "A Tour must have a name"],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    require: [true, "A Tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    require: [true, "A Tour must have a maximum group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A Tour must have a difficulty"],
  },
  ratingsAverage: { type: Number, default: 4.5 },
  ratingsQuantity: { type: Number, default: 0 },
  price: { type: Number, required: [true, "A Tour must have a price"] },
  priceDiscount: Number,
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
};

const tourSchema = new mongoose.Schema(schemaOfTheTours);

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
