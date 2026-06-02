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

  // find original url
  const originalUrl =
    await redirectUrl(shortCode);

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