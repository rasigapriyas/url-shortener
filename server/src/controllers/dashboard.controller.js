// import service
const {
  getDashboardData,
} = require(
  "../services/dashboard.service"
);

// dashboard controller
const getDashboard =
  async (req, res) => {

    // get user id from jwt
    const userId =
      req.user.userId;

    // fetch dashboard data
    const result =
      await getDashboardData(
        userId
      );

    // send response
    res.json(result);

  };

// export controller
module.exports = {
  getDashboard,
};