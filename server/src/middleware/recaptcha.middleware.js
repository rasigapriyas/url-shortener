const axios = require("axios");

// verify recaptcha
const verifyRecaptcha =
  async (req, res, next) => {

    try {

      if (
        !process.env.RECAPTCHA_SECRET_KEY ||
        process.env.RECAPTCHA_SECRET_KEY === "dev-disabled"
      ) {
        return next();
      }

      // get token from frontend
      const recaptchaToken =
        req.body?.recaptchaToken ||
        req.body?.[
          "g-recaptcha-response"
        ];

      // token missing
      if (!recaptchaToken) {

        return res.status(400).json({
          message:
            "reCAPTCHA token missing",
        });

      }

      const verifyParams =
        new URLSearchParams({
          secret:
            process.env
              .RECAPTCHA_SECRET_KEY,
          response:
            recaptchaToken,
        });

      // verify with google
      const response =
        await axios.post(
          "https://www.google.com/recaptcha/api/siteverify",
          verifyParams,
          {
            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },
            proxy: false,
            timeout: 10000,
            validateStatus: () =>
              true,
          }
        );

      if (response.status >= 400) {
        return res.status(502).json({
          message:
            "Unable to verify reCAPTCHA",
        });
      }

      const verification =
        response.data;

      // verification failed
      if (
        !verification.success
      ) {

        return res.status(400).json({
          message:
            "reCAPTCHA verification failed",
          errors:
            verification[
              "error-codes"
            ] || [],
        });

      }

      next();

    } catch (error) {

      console.error(
        "reCAPTCHA verification error:",
        error.message ||
        error.code ||
        error
      );

      return res.status(500).json({
        message:
          "reCAPTCHA verification error",
        error:
          error.message ||
          error.code ||
          "Unknown error",
      });

    }

  };

module.exports =
  verifyRecaptcha;
