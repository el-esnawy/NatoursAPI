const express = require("express");

const authController = require("../Controllers/authController");
const userController = require("../Controllers/userControllers");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotpassword", authController.forgotPassword);
router.patch("/resetpassword/:token", authController.resetPassword);

router.use(authController.protect);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.delete("/deleteMe", userController.deleteMe);

router.patch("/updateMe", userController.updateMe);

router.get("/me", userController.getMe, userController.getUserByID);

router.use(authController.authorize("admin"));
router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUserByID)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
