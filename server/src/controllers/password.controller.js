// import service
const {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../services/auth.service");
const { send } = require("../utils/http");
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
    send(res, result);

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
    send(res, result);

  };
  // reset password controller
const changePassword =
  async (req, res) => {

    // get request data
    const {
      email,
      newPassword,
      resetTicket,
    } = req.body;

    // reset password
    const result =
      await resetPassword(
        email,
        newPassword,
        resetTicket
      );

    // send response
    send(res, result);

  };

// export controllers
module.exports = {
  sendResetOtp,
  verifyForgotOtp,
  changePassword,
};
