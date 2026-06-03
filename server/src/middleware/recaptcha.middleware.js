const axios = require("axios");

// verify recaptcha
const verifyRecaptcha =
  async (req, res, next) => {

    try {

      // get token from frontend
      const {
        recaptchaToken,
      } = req.body;

      // token missing
      if (!recaptchaToken) {

        return res.status(400).json({
          message:
            "reCAPTCHA token missing",
        });

      }

      // verify with google
      const response =
        await axios.post(
          "https://www.google.com/recaptcha/api/siteverify",
          null,
          {
            params: {
              secret:
                process.env
                  .RECAPTCHA_SECRET_KEY,
              response:
                recaptchaToken,
            },
          }
        );

      // verification failed
      if (
        !response.data.success
      ) {

        return res.status(400).json({
          message:
            "reCAPTCHA verification failed",
        });

      }

      next();

    } catch (error) {

      return res.status(500).json({
        message:
          "reCAPTCHA verification error",
      });

    }

  };

module.exports =
  verifyRecaptcha;