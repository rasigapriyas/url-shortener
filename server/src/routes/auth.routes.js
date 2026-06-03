// jwt middleware
const authenticate =
  require("../middleware/auth.middleware");

// import express
const express = require("express");

// create router
const router = express.Router();

// import auth controllers
const {
  register,
  verifyUserOtp,
  login,
} = require("../controllers/auth.controller");

// import password controllers
const {
  sendResetOtp,
  verifyForgotOtp,
  changePassword,
} = require(
  "../controllers/password.controller"
);

// register route
router.post(
  "/register",
  register
);

// verify otp route
router.post(
  "/verify-otp",
  verifyUserOtp
);

// login route
router.post(
  "/login",
  login
);

// protected profile route
router.get(
  "/profile",
  authenticate,
  (req, res) => {

    res.json({
      message:
        "Protected route accessed",
      user: req.user,
    });

  }
);

// forgot password route
router.post(
  "/forgot-password",
  sendResetOtp
);

// verify reset otp route
router.post(
  "/verify-reset-otp",
  verifyForgotOtp
);

// reset password route
router.post(
  "/reset-password",
  changePassword
);

// export router
module.exports = router;