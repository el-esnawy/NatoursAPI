const Tour = require("../Model/tourModel");
const APIFeatures = require("../utils/apiFeatures");

exports.aliasTopTours = async (req, res, next) => {
  req.query = {
    limit: req.query.limit || "5",
    sort: req.query.sort || "-ratingsAverage,price",
    fields: req.query.fields || "name,price,ratingsAverage,summary,difficulty",
  };
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const tourFeatures = new APIFeatures(Tour, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const allTours = await tourFeatures.query;

    if (allTours.length === 0) throw new Error("This Page does not Exist");

    res.status(200).json({
      status: "success",
      results: allTours.length,
      data: {
        tours: allTours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      message: error.message,
    });
  }
};
exports.createTour = async (req, res) => {
  //calls the save on the newTour
  //const newTour - new Tour({})
  // newTour.save()
  //calls save on the model

  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error,
    });
  }
};
exports.getTourByID = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    //SAME METHOD AS ABOVE
    // const tour = await Tour.findOne({ _id: req.params.id });

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error,
    });
  }
};
exports.updateTourByID = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      //to return the new document
      new: true,
      runValidators: true,
    });

    // SAME AS ABOVE
    // const tour = await Tour.findOneAndUpdate(
    //   { _id: req.params.id },
    //   req.body,
    //   {
    //     new: true,
    //     runValidators: true,
    //   }
    // );

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error,
    });
  }
};

exports.deleteTourByID = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndRemove(req.params.id);
    res.status(204).json({
      status: "succes",
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error,
    });
  }
};

/// ALTERNATIVE TO THE CLASS APIFEATURES

// build the query
// const queryObj = { ...req.query };

// 1 -removes all non-existant fields in the schema
// const queryObjectKeys = Object.keys(queryObj);
// const TourSchemaKeys = Object.keys(Tour.model("Tour").schema.obj);
// queryObjectKeys.forEach((queryObjectKey) => {
//   if (!TourSchemaKeys.includes(queryObjectKey)) {
//     delete queryObj[queryObjectKey];
//   }
// });
// ADVANCED FILTERING
// 2- replacing gte,gt,lte,lt with a $ before it so MongoDB can understand /// it
// const queryString = JSON.stringify(queryObj).replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   (match) => `$${match}`
// );

// ALTERNATIVE TO THE ABOVE
//removing all non-existant fields
// const excludedFields = ["page", "sort", "limit", "fields"];
// delete operation for object property
// excludedFields.forEach((el) => delete queryObj[el]);
//  const {page,sort,limit,field, ...queryObje} = { ...req.query };

// let query = Tour.find();

// SORTING
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(",").join(" ");
//   query = query.sort(sortBy);
// } else {
//   query = query.sort("-createdAt");
// }

// FIELD LIMITING
// if (req.query.fields) {
//   const fields = req.query.fields.split(",").join(" ");
//   query = query.select(fields);
// } else {
//   //remove a field
//   query = query.select("-__v");
// }

// pagination and RPG
//skip X results before querying data, limit number of data to Y
// query.skip(X).limit(Y)

// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numOfTours = await Tour.countDocuments();
//   if (skip >= numOfTours) throw new Error("This page does not Exist");
// }

// EXECUTE THE QUERY

// NOTE:
// FILTER OBJECT
// { difficulty: "easy", duration:{$gte:5}}

// same as above
// const allTours = await Tour.find()
//   .where("duration")
//   .equals(5)
//   .where("difficulty")
//   .equals("easy");
