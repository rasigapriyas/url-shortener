// import url service
const {
  createShortUrl,
  deleteUrl,
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

// delete url controller
const removeUrl = async (
  req,
  res
) => {

  // get user id from jwt
  const userId =
    req.user.userId;

  // get url id
  const { id } = req.params;

  // delete url
  const result =
    await deleteUrl(
      userId,
      id
    );

  // send response
  res.json(result);

};

// export controller
module.exports = {
  createUrl,
  removeUrl,
};