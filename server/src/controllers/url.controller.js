// import url service
const {
  createShortUrl,
  deleteUrl,
  updateUrl,
  bulkCreateShortUrls,
} = require("../services/url.service");
const { send } = require("../utils/http");

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
  send(res, result);

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
  send(res, result);

};

const editUrl = async (req, res) => {
  const result = await updateUrl(
    req.user.userId,
    req.params.id,
    req.body
  );

  send(res, result);
};

const bulkCreateUrls = async (req, res) => {
  const result = await bulkCreateShortUrls(
    req.user.userId,
    req.body.urls
  );

  send(res, result);
};

// export controller
module.exports = {
  createUrl,
  removeUrl,
  editUrl,
  bulkCreateUrls,
};
