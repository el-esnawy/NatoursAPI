const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) return next(new AppError("No document Found", 404));
    res.status(204).json({
      status: "succes",
      data: null,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const documentFeatures = new APIFeatures(Model, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const allDocuments = await documentFeatures.query;

    if (allDocuments.length === 0) throw new Error("This Page does not Exist");

    res.status(200).json({
      status: "success",
      results: allDocuments.length,
      data: {
        documents: allDocuments,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      //to return the new document
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError("No Document Found with This ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const document = await query;
    //SAME METHOD AS ABOVE
    // const tour = await Tour.findOne({ _id: req.params.id });

    if (!document) return next(new AppError("No Tour Found with that ID", 404));

    // const NoTourFound = new Error("No Tour Found");
    // NoTourFound.statusCode = 404;
    // if (!tour) return next(NoTourFound);

    res.status(200).json({
      status: "success",
      data: {
        document,
      },
    });
  });
