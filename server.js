const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

//app needs to run after the dotenv otherwise it will not read the env var
const app = require("./app");

const port = process.env.PORT || 3000;
// START THE SERVER
app.listen(port, () => {
  console.log(`App is running on Port: ${port}`);
});
