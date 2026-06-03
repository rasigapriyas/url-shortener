// database connection
const prisma = require("../config/prisma");

// get dashboard data
const getDashboardData = async (
  userId
) => {

  // count total urls
  const totalUrls =
    await prisma.url.count({
      where: {
        userId,
      },
    });

  // get all urls
  const urls =
    await prisma.url.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  // calculate total clicks
  const totalClicks =
    urls.reduce(
      (sum, url) =>
        sum + url.totalClicks,
      0
    );

  // latest 5 urls
  const recentUrls =
    urls.slice(0, 5);

  // return dashboard data
  return {
    totalUrls,
    totalClicks,
    recentUrls,
  };

};

// export service
module.exports = {
  getDashboardData,
};