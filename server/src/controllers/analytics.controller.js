// import analytics service
const {
  getUrlAnalytics,
} = require("../services/url.service");

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
      shortCode
    );

  // send response
  res.json(result);

};

// export controller
module.exports = {
  getAnalytics,
};