const rateLimit =
  require("express-rate-limit");

// login limiter
const loginLimiter =
  rateLimit({

    windowMs:
      15 * 60 * 1000,

    max: 10,

    message: {
      message:
        "Too many login attempts. Try again later.",
    },

  });

// register limiter
const registerLimiter =
  rateLimit({

    windowMs:
      15 * 60 * 1000,

    max: 5,

    message: {
      message:
        "Too many registrations. Try again later.",
    },

  });

module.exports = {
  loginLimiter,
  registerLimiter,
};