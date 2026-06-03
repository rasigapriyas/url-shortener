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
  editUrl,
  bulkCreateUrls,
} = require("../controllers/url.controller");

// import redirect controller
const {
  redirect,
} = require("../controllers/redirect.controller");

// import analytics controller
const {
  getAnalytics,
  getPublicUrlStats,
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

// bulk create short urls
router.post(
  "/bulk",
  authenticate,
  bulkCreateUrls
);

// edit destination, expiry, or status
router.patch(
  "/:id",
  authenticate,
  editUrl
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

// public stats
router.get(
  "/public/:shortCode",
  getPublicUrlStats
);

// redirect route
router.get(
  "/:shortCode",
  redirect
);

// export router
module.exports = router;
