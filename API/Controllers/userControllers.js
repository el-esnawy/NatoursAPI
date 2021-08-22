const User = require("../Models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const filterObject = (object, ...allowedFields) => {
  const newObject = {};
  Object.keys(object).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObject[key] = object[key];
    }
  });
  return newObject;
};

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUserByID = factory.getOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "Success",
    data: {
      results: users.length,
      data: {
        users,
      },
    },
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1- Create error if user tries to update password
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError("You Can Not Update Password on This Route", 400));
  // 2- update user document
  const filteredBody = filterObject(req.body, "name", "email");
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    message: "User Successfully deleted",
    data: null,
  });
});
