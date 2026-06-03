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
    userAgent:
      req.headers["user-agent"],

    referrer:
      req.headers.referer,

    country:
      req.headers["cf-ipcountry"],

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

  if (originalUrl === "EXPIRED") {
    return res.status(410).json({
      message: "URL expired or inactive",
    });
  }

  // redirect user
  res.redirect(originalUrl);

};

// export controller
module.exports = {
  redirect,
};
