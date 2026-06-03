// import auth services
const {
  registerUser,
  verifyOtp,
  loginUser,
  resendUserOtp,
  refreshAccessToken,
  logoutUser,
} = require(
  "../services/auth.service"
);
const { send } = require("../utils/http");
// handle register request
const register = async (req, res) => {

  const result = await registerUser(req.body);

  send(res, result);

};

// handle otp verification request
const verifyUserOtp = async (req, res) => {

  const result = await verifyOtp(req.body);

  send(res, result);

};

// handle login request
const login = async (req, res) => {

  const result = await loginUser(req.body);

  send(res, result);

};
const resendOtp =
  async (req, res) => {

    const { email } =
      req.body;

    const result =
      await resendUserOtp(
        email
      );

    send(res, result);

  };

const refreshToken =
  async (req, res) => {
    const result =
      await refreshAccessToken(
        req.body.refreshToken
      );

    send(res, result);
  };

const logout =
  async (req, res) => {
    const result =
      await logoutUser(
        req.user.userId,
        req.body.refreshToken
      );

    send(res, result);
  };

// export controller functions
module.exports = {
  register,
  verifyUserOtp,
  login,
  resendOtp,
  refreshToken,
  logout,
};
