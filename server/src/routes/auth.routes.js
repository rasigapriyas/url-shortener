// jwt middleware
const authenticate =
  require("../middleware/auth.middleware");
// import express
const express = require("express");

// create router
const router = express.Router();

// import controllers
const {
  register,
  verifyUserOtp,
  login,
} = require("../controllers/auth.controller");

// register route
router.post("/register", register);

// verify otp route
router.post("/verify-otp", verifyUserOtp);

// login route
router.post("/login", login);
// protected route test
router.get(
  "/profile",
  authenticate,
  (req, res) => {

    res.json({
      message: "Protected route accessed",
      user: req.user,
    });

  }
);

// export router
module.exports = router;