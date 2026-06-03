// import express
const express = require("express");

// create router
const router = express.Router();

// jwt middleware
const authenticate =
  require("../middleware/auth.middleware");

// import url controller
const {
  createUrl,
  removeUrl,
} = require("../controllers/url.controller");

// import redirect controller
const {
  redirect,
} = require("../controllers/redirect.controller");

// import analytics controller
const {
  getAnalytics,
} = require(
  "../controllers/analytics.controller"
);

// import dashboard controller
const {
  getDashboard,
} = require(
  "../controllers/dashboard.controller"
);

// create short url
router.post(
  "/create",
  authenticate,
  createUrl
);

// delete url
router.delete(
  "/:id",
  authenticate,
  removeUrl
);

// dashboard data
router.get(
  "/dashboard",
  authenticate,
  getDashboard
);

// analytics data
router.get(
  "/analytics/:shortCode",
  authenticate,
  getAnalytics
);

// redirect route
router.get(
  "/:shortCode",
  redirect
);

// export router
module.exports = router;