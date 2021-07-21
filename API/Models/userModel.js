const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const schema = {
  name: {
    type: String,
    required: [true, "A User must have a name"],
  },
  email: {
    type: String,
    required: [true, "please provide an email"],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (value) {
        return validator.isEmail(value);
      },
      message: function (value) {
        return `Message: ${value.value} is not a valid email address`;
      },
    },
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    minlength: 8,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Message: Passwords are not the identical",
    },
  },
  passwordChangedAt: Date,
  tokenPasswordReset: String,
  tokenPasswordExpiresIn: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
};

const userSchema = new mongoose.Schema(schema);

userSchema.pre(/^find/, function (next) {
  // this point to current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("save", async function (next) {
  // only runs if ps is modified
  if (!this.isModified("password")) return next();

  //hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 14);
  // delete password confirm field
  this.passwordConfirm = undefined;
});

// instance method: available on all documents of a certain collection

userSchema.methods.correctPassword = async function (
  cadidatePassword,
  userPassword
) {
  return await bcrypt.compare(cadidatePassword, userPassword);
};
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  next();
});
userSchema.methods.changedPasswodAfter = function (tokenIAT) {
  if (this.passwordChangedAt) {
    const psModifiedOn = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return tokenIAT < psModifiedOn;
  }
  return false;
};

userSchema.methods.passwordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.tokenPasswordReset = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // this.tokenPasswordExpiresIn = Date.now() + 12 * 60 * 60 * 1000;
  const currentDate = new Date();
  currentDate.setHours(
    currentDate.getHours() +
      parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS, 10)
  );
  this.tokenPasswordExpiresIn = currentDate;

  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
