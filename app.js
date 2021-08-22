const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./API/utils/appError");
const globalErrorHandler = require("./API/Controllers/errorController");
const tourRouter = require("./API/Routes/tourRoutes");
const userRouter = require("./API/Routes/userRoutes");
const reviewRouter = require("./API/Routes/reviewRoutes");

const app = express();

//GLOBAL MIDDLEWARES

//TO SET security HTTP Headers
app.use(helmet());

// limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP, please try again in a while",
});

app.use("/api", limiter);

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//data from body is added to request object and parsed
// putting the data into req.body
app.use(
  express.json({
    limit: "10kb",
  })
);

// DATA SANITIZATION AGAINST NoSQL query Injection
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xssClean());

// prevent param pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
    ],
  })
);

//serving static files
app.use(express.static(`${__dirname}/public`));

// MIDDLEWARE TO ADD REQUEST TIME TO THE REQUEST
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// IMPORTANT to include Version to enable us in the future to develop without
// breaking the API

// ALL ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't Find ${req.originalUrl} on this Server!`, 404));

  // res.status(404).json({
  //   status: "Fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  // const error = new Error("Route not available");
  // error.status = "fail";
  // error.statusCode = 404;
  // next(error);
});

// middleware to handle error, will have 4 inputs and express will recognize it // as an error handling middleware

app.use(globalErrorHandler);

module.exports = app;

///////////////////////////////////////
//OLD ROUTES
//ROUTES
// app.route('/api/v1/tours').get(getAllTours).post(createTour);
//SAME AS ABOVE
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);

// app
//   .route('/api/v1/tours/:id')
//   .get(getTourByID)
//   .patch(updateTourByID)
//   .delete(deleteTourByID);
//SAME AS ABOVE
// app.get('/api/v1/tours/:id', getTourByID);
// PATCH : EXPECT APP TO RECEIEVE THE PROPERTIES TO BE UPDATED
// PUT : EXPECT APP TO RECEIVES THE ENTIRE OBJECT
// app.patch('/api/v1/tours/:id', updateTourByID);
// app.delete('/api/v1/tours/:id', deleteTourByID);

// app.route('/api/v1/users').get(getAllUsers).post(createUser);
// app
//   .route('/api/v1/users/:id')
//   .patch(getUserByID)
//   .patch(updateUser)
//   .delete(deleteUser);
