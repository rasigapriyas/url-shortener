// import express
const express = require("express");

// create router
const router = express.Router();

// jwt middleware
const authenticate =
  require("../middleware/auth.middleware");

// import controller
const {
  createUrl,
} = require("../controllers/url.controller");

// redirect controller
const {
  redirect,
} = require("../controllers/redirect.controller");

// create short url route
router.post(
  "/create",
  authenticate,
  createUrl
);

// redirect route
router.get(
  "/:shortCode",
  redirect
);

// export router
module.exports = router;