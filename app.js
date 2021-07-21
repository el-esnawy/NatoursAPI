const express = require("express");
const morgan = require("morgan");

const globalErrorHandler = require("./API/Controllers/errorController");
const AppError = require("./API/utils/appError");
const tourRouter = require("./API/Routes/tourRoutes");
const userRouter = require("./API/Routes/userRoutes");

const app = express();

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//data from body is added to request object and parsed
app.use(express.json());

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
