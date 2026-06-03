// import analytics service
const {
  getUrlAnalytics,
  getPublicStats,
} = require("../services/url.service");
const { send } = require("../utils/http");

// get analytics controller
const getAnalytics = async (
  req,
  res
) => {

  // get shortcode
  const { shortCode } = req.params;

  // fetch analytics
  const result =
    await getUrlAnalytics(
      req.user.userId,
      shortCode
    );

  // send response
  send(res, result);

};

const getPublicUrlStats = async (
  req,
  res
) => {
  const result =
    await getPublicStats(
      req.params.shortCode
    );

  send(res, result);
};

// export controller
module.exports = {
  getAnalytics,
  getPublicUrlStats,
};
