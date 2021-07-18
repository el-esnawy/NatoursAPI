const mongoose = require("mongoose");
const chalk = require("chalk");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

//app needs to run after the dotenv otherwise it will not read the env var
const app = require("./app");

const port = process.env.PORT || 3000;

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

// makes sure to return new updated document and not the original
// mongoose.set("returnOriginal", false);

// START THE SERVER

app.listen(port, () => {
  console.log(`App is running on Port: ${port}`);
});
