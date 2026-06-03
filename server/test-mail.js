// Quick SMTP smoke test.
//   node test-mail.js you@example.com
// Sends a sample OTP email using the same mailer the app uses.
require("dotenv").config();

const { sendOtpEmail } = require("./src/config/mailer");

const to = process.argv[2] || process.env.SMTP_USER;

if (!to) {
  console.error("Usage: node test-mail.js <recipient-email>");
  process.exit(1);
}

(async () => {
  console.log(`Sending test code to ${to} ...`);
  const delivered = await sendOtpEmail(to, "123456", "REGISTER");
  if (delivered) {
    console.log("✅ Email sent. Check the inbox (and spam).");
  } else {
    console.log(
      "⚠️  Not delivered by email — check the SMTP error above. The code was logged to the console as a fallback."
    );
  }
  // give nodemailer a moment to flush, then exit
  setTimeout(() => process.exit(0), 1500);
})();
