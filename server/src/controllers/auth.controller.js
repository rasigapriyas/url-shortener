// import auth services
const {
  registerUser,
  verifyOtp,
  loginUser,
} = require("../services/auth.service");

// handle register request
const register = async (req, res) => {

  const result = await registerUser(req.body);

  res.json(result);

};

// handle otp verification request
const verifyUserOtp = async (req, res) => {

  const result = await verifyOtp(req.body);

  res.json(result);

};

// handle login request
const login = async (req, res) => {

  const result = await loginUser(req.body);

  res.json(result);

};

// export controller functions
module.exports = {
  register,
  verifyUserOtp,
  login,
};