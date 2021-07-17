const dotenv = require("dotenv");
const chalk = require("chalk");
const mongoose = require("mongoose");

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

//app needs to run after the dotenv otherwise it will not read the env var
const app = require("./app");

const port = process.env.PORT || 3000;
// START THE SERVER
app.listen(port, () => {
  console.log(`App is running on Port: ${port}`);
});
