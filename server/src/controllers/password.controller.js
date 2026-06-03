// import service
const {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../services/auth.service");
// forgot password controller
const sendResetOtp =
  async (req, res) => {

    // get email
    const { email } = req.body;

    // generate otp
    const result =
      await forgotPassword(
        email
      );

    // send response
    res.json(result);

  };

// verify reset otp controller
const verifyForgotOtp =
  async (req, res) => {

    // get request data
    const {
      email,
      otp,
    } = req.body;

    // verify otp
    const result =
      await verifyResetOtp(
        email,
        otp
      );

    // send response
    res.json(result);

  };
  // reset password controller
const changePassword =
  async (req, res) => {

    // get request data
    const {
      email,
      newPassword,
    } = req.body;

    // reset password
    const result =
      await resetPassword(
        email,
        newPassword
      );

    // send response
    res.json(result);

  };

// export controllers
module.exports = {
  sendResetOtp,
  verifyForgotOtp,
  changePassword,
};