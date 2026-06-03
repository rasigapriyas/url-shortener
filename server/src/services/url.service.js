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
  // validate url
const urlPattern =
  /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;

if (
  !urlPattern.test(
    originalUrl
  )
) {
  return {
    message:
      "Please enter a valid URL",
  };
}

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
  shortCode,
  visitData
) => {

  // find url by shortcode
  const url =
    await prisma.url.findUnique({
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

  // save visit record
  await prisma.visit.create({
    data: {
      urlId: url.id,
      ipAddress:
        visitData.ipAddress,
      browser:
        visitData.browser,
    },
  });

  // return original url
  return url.originalUrl;

};

// get url analytics
const getUrlAnalytics = async (
  shortCode
) => {

  // find url with visits
  const url =
    await prisma.url.findUnique({
      where: {
        shortCode,
      },
      include: {
        visits: {
          orderBy: {
            visitedAt: "desc",
          },
          take: 10,
        },
      },
    });

  // url not found
  if (!url) {
    return {
      message: "URL not found",
    };
  }

  // return analytics
  return {
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    totalClicks: url.totalClicks,
    status: url.status,
    createdAt: url.createdAt,
    recentVisits: url.visits,
  };

};
// delete url
const deleteUrl = async (
  userId,
  urlId
) => {

  // find url
  const url =
    await prisma.url.findFirst({
      where: {
        id: Number(urlId),
        userId,
      },
    });

  // url not found
  if (!url) {
    return {
      message: "URL not found",
    };
  }

  // delete visits first
  await prisma.visit.deleteMany({
    where: {
      urlId: url.id,
    },
  });

  // delete url
  await prisma.url.delete({
    where: {
      id: url.id,
    },
  });

  // success response
  return {
    message: "URL deleted successfully",
  };

};

// export service functions
module.exports = {
  createShortUrl,
  redirectUrl,
  getUrlAnalytics,
  deleteUrl,
};