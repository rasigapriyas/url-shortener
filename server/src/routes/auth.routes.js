// import express
const express = require("express");

// create router
const router = express.Router();

// jwt middleware
const authenticate =
  require("../middleware/auth.middleware");

// rate limiters
const {
  loginLimiter,
  registerLimiter,
} = require(
  "../middleware/rateLimiter.middleware"
);

// recaptcha middleware
const verifyRecaptcha =
  require(
    "../middleware/recaptcha.middleware"
  );

// auth controllers
const {
  register,
  verifyUserOtp,
  login,
  resendOtp,
  refreshToken,
  logout,
} = require(
  "../controllers/auth.controller"
);

// password controllers
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
  registerLimiter,
  verifyRecaptcha,
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
  loginLimiter,
  verifyRecaptcha,
  login
);

// resend otp route
router.post(
  "/resend-otp",
  resendOtp
);

// profile route
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
  verifyRecaptcha,
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

// refresh access token
router.post(
  "/refresh",
  refreshToken
);

// logout route
router.post(
  "/logout",
  authenticate,
  logout
);

// export router
module.exports = router;
