const fs = require("fs");
const dotenv = require("dotenv");
const chalk = require("chalk");
const mongoose = require("mongoose");

const Tour = require("../../API/Model/tourModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(chalk.blackBright.bgGreen.bold("DB Connection Successfull"));
  });

// READ JSON FILE

const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

// const reviews = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
// );

// const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));

// IMPORT DATA INTO DB

const importData = async () => {
  try {
    await Tour.create(tour);
    console.log(chalk.bgBlueBright("Data Successfully Loaded"));
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// Delete all data from collection
const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    console.log(chalk.bgRed("Data Successfully Deleted"));
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
}
if (process.argv[2] === "--delete") {
  deleteAllData();
}
