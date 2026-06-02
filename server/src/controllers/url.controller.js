// import url service
const {
  createShortUrl,
} = require("../services/url.service");

// create short url controller
const createUrl = async (req, res) => {

  // get user id from jwt
  const userId = req.user.userId;

  // create url
  const result =
    await createShortUrl(
      userId,
      req.body
    );

  // send response
  res.json(result);

};

// export controller
module.exports = {
  createUrl,
};