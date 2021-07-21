const chalk = require("chalk");
const AppError = require("../utils/appError");

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error,
    stack: error.stack,
  });
};

const sendErrorProduction = (error, res) => {
  if (error.isOperational) {
    // expected operational error
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    //programming or other unknown error: no details to be leaked to user
    console.error(chalk.bgRedBright("ERROR "), error);
    res.status(500).json({
      status: "ERROR",
      message: "Something went very wrong",
    });
  }
};

const handleMongoError = (error) => {
  let message = "duplicate entry of '";

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(error.keyValue)) {
    message += `${key}' with value: '${value}`;
  }

  return new AppError(message, 400);
};
const handleValidationError = (error) => {
  let message = "Invalid Data Sent: ";
  const errorObjects = Object.values(error.errors);
  const errorFields = Object.keys(error.errors);
  // eslint-disable-next-line array-callback-return
  errorObjects.map((err, index) => {
    message += `Field: '${errorFields[index]}' With Error Message: '${err.message}'`;
    if (index !== errorFields.length - 1) {
      message += ", ";
    } else {
      message += " ";
    }
  });
  return new AppError(message, 400);
};
const handleCastError = (error) => {
  const message = `Invalid ${error.path} : ${error.value}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid Token, Please sign in again", 401);

const handleJWTExpires = (error) =>
  new AppError(
    `Your Token has expired ${error.expiredAt.toLocaleString(
      "en-US"
    )}, please sign in again`,
    401
  );

module.exports = (error, req, res, next) => {
  if (!error.statusCode) error.statusCode = 500;
  if (!error.status) error.status = "Error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    // 3 Nos. types of errors thrown by mongoose
    // a- cast error
    // b- validation error

    let err = Object.assign(error);

    if (err.name === "MongoError") err = handleMongoError(err);
    if (err.name === "CastError") err = handleCastError(err);
    if (err.name === "ValidationError") err = handleValidationError(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError(err);
    if (err.name === "TokenExpiredError") err = handleJWTExpires(err);

    sendErrorProduction(err, res);
  }

  next();
};
