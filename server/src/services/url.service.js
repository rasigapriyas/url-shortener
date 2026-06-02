// database connection
const prisma = require("../config/prisma");

// generate random shortcode
const generateShortCode = () => {

  return Math.random()
    .toString(36)
    .substring(2, 8);

};

// create short url
const createShortUrl = async (
  userId,
  urlData
) => {

  // get original url
  const { originalUrl } = urlData;

  // generate shortcode
  const shortCode =
    generateShortCode();

  // save url in database
  const url = await prisma.url.create({
    data: {
      userId,
      originalUrl,
      shortCode,
    },
  });

  // success response
  return {
    message: "URL created successfully",
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
  };

};
// redirect using shortcode
const redirectUrl = async (
  shortCode
) => {

  // find url by shortcode
  const url = await prisma.url.findUnique({
    where: {
      shortCode,
    },
  });

  // url not found
  if (!url) {
    return null;
  }

  // increase click count
  await prisma.url.update({
    where: {
      id: url.id,
    },
    data: {
      totalClicks: {
        increment: 1,
      },
    },
  });

  // return original url
  return url.originalUrl;

};

module.exports = {
  createShortUrl,
  redirectUrl,
};