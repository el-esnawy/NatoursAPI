const express = require("express");

const authController = require("../Controllers/authController");
const userController = require("../Controllers/userControllers");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotpassword", authController.forgotPassword);
router.patch("/resetpassword/:token", authController.resetPassword);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

router.patch("/updateMe", authController.protect, userController.updateMe);

router
  .route("/")
  .get(
    authController.protect,
    authController.authorize("admin"),
    userController.getAllUsers
  )
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUserByID)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
