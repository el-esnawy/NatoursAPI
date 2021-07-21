const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { promisify } = require("util");
const AppError = require("../utils/appError");
const User = require("../Models/userModel");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

const signtoken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    algorithm: "HS512",
  });

const createSendToken = (user, statusCode, res) => {
  const token = signtoken(user._id);
  res.status(statusCode).json({
    status: "Success",
    token,
  });
};

exports.authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Not Authorized for this action", 401));
    }
    next();
  };

exports.protect = catchAsync(async (req, res, next) => {
  //1- get the token and check if it exits
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new AppError("Forbidden Access", 403));
  //2- validate the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3-  check if the user exists in the DB
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        "The account is no longer active or No user exits with these credentials",
        401
      )
    );

  //4- check if user changed password after token was issued
  if (currentUser.changedPasswodAfter(decoded.iat))
    return next(
      new AppError("Password receently changed, Please log in again", 401)
    );

  //5- Grant access and call next()

  req.user = currentUser;
  next();
});
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1 - check if email & password exists
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  //2- check if user exists & password exits
  const user = await User.findOne({ email }).select("+password"); // to manually select passwor

  //Better to no do it like to not give potential attacker info
  // if (!user) return next(new AppError("Invalid Email"));
  // const correct = await user.correctPassword(password, user.password);
  // if (!correct) return next(new AppError("Invalid Password "));

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Invalid Email or Password"));

  //3 if everything ok then send token
  createSendToken(user, 200, res);
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1- get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("No User exists with this email", 404));

  const resetToken = user.passwordResetToken();
  await user.save({ validateBeforeSave: false });

  //2- generate random reset token
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetpassword/${resetToken}`;
  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to : ${resetURL}.\nIf you didn't submit this request, please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Token Valid for 12 Hours",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token Sent to Email",
    });
  } catch (error) {
    user.tokenPasswordReset = undefined;
    user.tokenPasswordExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("There was an error sending an email", 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const receivedToken = req.params.token;
  const encryptedToken = crypto
    .createHash("sha256")
    .update(receivedToken)
    .digest("hex");

  const user = await User.findOne({
    tokenPasswordReset: encryptedToken,
  }).select("+password");
  if (!user) return next(new AppError("Invalid Token, please resubmit", 400));

  if (user.tokenPasswordExpiresIn < Date.now())
    return next(new AppError("Token Expired, please resubmit request", 400));

  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm)
    return next(new AppError("please enter a new password", 400));

  if ((await user.correctPassword(password, user.password)) === true)
    return next(
      new AppError(
        "Your New Password Can Not Be The Same ss Your Old Password",
        400
      )
    );
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.tokenPasswordReset = undefined;
  user.tokenPasswordExpiresIn = undefined;
  const updatedUser = await user.save();

  if (updatedUser) {
    createSendToken(user, 200, res);
  } else {
    return next(
      new AppError(
        "Something went wrong Reseting the Password, please try again at a Later time",
        500
      )
    );
  }
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1- get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2 - check if posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError("Your Current Password is wrong", 401));
  // 3- if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  const newUserPasswordChanged = await user.save();
  // 4- log user in,send JWT
  if (newUserPasswordChanged) {
    createSendToken(newUserPasswordChanged, 201, res);
  }
});
