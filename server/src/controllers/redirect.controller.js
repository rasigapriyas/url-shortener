// import service
const {
  redirectUrl,
} = require("../services/url.service");

// handle redirect request
const redirect = async (
  req,
  res
) => {

  // get shortcode
  const { shortCode } = req.params;

  // collect visit info
  const visitData = {

    // visitor ip
    ipAddress: req.ip,

    // browser info
    browser:
      req.headers["user-agent"],

  };

  // find original url
  const originalUrl =
    await redirectUrl(
      shortCode,
      visitData
    );

  // url not found
  if (!originalUrl) {
    return res.status(404).json({
      message: "URL not found",
    });
  }

  // redirect user
  res.redirect(originalUrl);

};

// export controller
module.exports = {
  redirect,
};