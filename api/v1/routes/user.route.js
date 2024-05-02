const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const registerValidate = require("../validates/register.validate");
const loginValidate = require("../validates/login.validate");
const authMiddleware = require("../middlewares/auth.middleware");
router.post("/register", registerValidate, userController.register);
router.post("/login", loginValidate, userController.login);
router.post("/password/forgot", userController.forgotPassword);
router.post("/password/otp", userController.otp);
router.post(
  "/password/reset",
  authMiddleware.requireAuth,
  userController.reset
);
router.get("/info", authMiddleware.requireAuth, userController.info);
router.get("/list", authMiddleware.requireAuth, userController.list);
module.exports = router;
