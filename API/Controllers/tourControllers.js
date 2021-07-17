const fs = require("fs");

const Tour = require("../Model/tourModel");

// ROUTE HANDLERS

exports.getAllTours = (req, res) => {};

exports.getTourByID = (req, res) => {};

exports.createTour = (req, res) => {
  // creates a new Tour on the mdoel used
  //calls the save on the new Tour
  // const newTour = new Tour({});
  // newTour.save()

  //ALTERNATIVE ON THE ABOVE
  //calls the save on the document instead
  //Tour.create({})

  res.status(200).json({
    status: "success",
  });
};

exports.updateTourByID = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "<TOUR UPDATED>",
    },
  });
};

exports.deleteTourByID = (req, res) => {
  res.status(204).json({
    status: "success",
    data: null,
  });
};
