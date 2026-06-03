const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");

const prisma = require("../config/prisma");
const { ok, fail } = require("../utils/http");
const { sendOtpEmail, exposeOtpInResponse } = require("../config/mailer");

// ----- config -----
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const BCRYPT_ROUNDS = 12;
const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// ----- helpers -----
const createOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const createTokens = async (user) => {
  const token = signAccessToken(user);
  const refreshToken = crypto.randomBytes(48).toString("hex");

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return { token, refreshToken };
};

const audit = (userId, action, metadata = undefined) =>
  prisma.auditLog.create({ data: { userId, action, metadata } });

const validatePassword = (password) =>
  typeof password === "string" && PASSWORD_RULE.test(password);

const PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character";

// Issue a fresh OTP: invalidates older unused ones, enforces resend cooldown,
// persists the new code, and delivers it out-of-band. Returns { error } on
// cooldown, otherwise { otp, delivered }.
const issueOtp = async (userId, purpose) => {
  const latest = await prisma.userOtp.findFirst({
    where: { userId, purpose, isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  if (latest && Date.now() - latest.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    const wait = Math.ceil(
      (OTP_RESEND_COOLDOWN_MS - (Date.now() - latest.createdAt.getTime())) / 1000
    );
    return { error: `Please wait ${wait}s before requesting another code` };
  }

  // Retire any outstanding codes for this purpose so only one is live.
  await prisma.userOtp.updateMany({
    where: { userId, purpose, isUsed: false },
    data: { isUsed: true, verified: true },
  });

  const otp = createOtp();

  await prisma.userOtp.create({
    data: {
      userId,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  return { otp };
};

// Validate a submitted OTP with attempt limiting. Returns { ok } or { error, status }.
const consumeOtp = async (userId, purpose, submittedOtp) => {
  const saved = await prisma.userOtp.findFirst({
    where: { userId, purpose, isUsed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!saved) {
    return { error: "No active code. Please request a new one", status: 400 };
  }

  if (saved.expiresAt < new Date()) {
    await prisma.userOtp.update({
      where: { id: saved.id },
      data: { isUsed: true, verified: true },
    });
    return { error: "Code has expired. Please request a new one", status: 400 };
  }

  if (saved.attemptCount >= OTP_MAX_ATTEMPTS) {
    await prisma.userOtp.update({
      where: { id: saved.id },
      data: { isUsed: true, verified: true },
    });
    return { error: "Too many attempts. Please request a new code", status: 429 };
  }

  if (saved.otp !== String(submittedOtp || "")) {
    const attemptCount = saved.attemptCount + 1;
    await prisma.userOtp.update({
      where: { id: saved.id },
      data: {
        attemptCount,
        ...(attemptCount >= OTP_MAX_ATTEMPTS
          ? { isUsed: true, verified: true }
          : {}),
      },
    });

    const left = OTP_MAX_ATTEMPTS - attemptCount;
    return {
      error:
        left > 0
          ? `Invalid code. ${left} attempt${left === 1 ? "" : "s"} remaining`
          : "Too many attempts. Please request a new code",
      status: left > 0 ? 400 : 429,
    };
  }

  // success → consume it
  await prisma.userOtp.update({
    where: { id: saved.id },
    data: { isUsed: true, verified: true },
  });

  return { ok: true };
};

// Attach the OTP to a response only in local/dev (no SMTP) for testability.
const withDevOtp = (payload, otp) =>
  exposeOtpInResponse ? { ...payload, otp } : payload;

// ----- register -----
const registerUser = async (userData) => {
  const { name, email, password } = userData;

  if (!name || name.trim().length < 2) {
    return fail("Name must be at least 2 characters", 422);
  }
  if (!validator.isEmail(String(email || ""))) {
    return fail("Please enter a valid email", 422);
  }
  if (!validatePassword(password)) {
    return fail(PASSWORD_MESSAGE, 422);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // A fully verified account already owns this email — block it.
  if (existingUser && existingUser.isVerified) {
    return fail("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // If the email exists but was never verified, let the user re-register:
  // refresh their name/password and send a fresh OTP instead of blocking them.
  const user = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: { name: name.trim(), password: hashedPassword },
      })
    : await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
        },
      });

  const issued = await issueOtp(user.id, "REGISTER");
  if (issued.error) {
    // hit the 60s resend cooldown — the previous code is still valid
    return fail(issued.error, 429);
  }
  const otp = issued.otp;
  await sendOtpEmail(user.email, otp, "REGISTER");
  await audit(user.id, "REGISTER", { email: user.email });

  return ok(
    withDevOtp(
      {
        message: "Registered. Check your email for the verification code.",
        userId: user.id,
        email: user.email,
      },
      otp
    ),
    201
  );
};

// ----- verify register OTP -----
const verifyOtp = async (otpData) => {
  const { email, otp } = otpData;

  const user = await prisma.user.findUnique({
    where: { email: String(email || "").toLowerCase() },
  });
  if (!user) return fail("User not found", 404);

  const result = await consumeOtp(user.id, "REGISTER", otp);
  if (result.error) return fail(result.error, result.status);

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });

  return ok({ message: "OTP verified successfully" });
};

// ----- login -----
const loginUser = async (loginData) => {
  const { email, password } = loginData;

  if (!validator.isEmail(String(email || "")) || !password) {
    return fail("Invalid email or password", 401);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return fail("Invalid email or password", 401);
  if (user.status !== "ACTIVE") return fail("Account is not active", 403);
  if (!user.isVerified) return fail("Please verify your account first", 403);
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return fail("Account temporarily locked", 423);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const attempts = user.failedLoginAttempts + 1;
    if (attempts >= 5) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
      return fail("Account locked for 15 minutes", 423);
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: attempts },
    });
    return fail("Invalid email or password", 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  const tokens = await createTokens(user);
  await audit(user.id, "LOGIN");

  return ok({
    message: "Login successful",
    user: { id: user.id, name: user.name, email: user.email },
    ...tokens,
  });
};

// ----- forgot password -----
const forgotPassword = async (email) => {
  if (!validator.isEmail(String(email || ""))) {
    return fail("Please enter a valid email", 422);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Do not reveal whether the email exists (enumeration protection).
  if (!user) {
    return ok({ message: "If that account exists, a reset code has been sent." });
  }

  const issued = await issueOtp(user.id, "FORGOT_PASSWORD");
  if (issued.error) return fail(issued.error, 429);

  await sendOtpEmail(user.email, issued.otp, "FORGOT_PASSWORD");

  return ok(
    withDevOtp(
      { message: "If that account exists, a reset code has been sent." },
      issued.otp
    )
  );
};

// ----- verify reset OTP -----
const verifyResetOtp = async (email, otp) => {
  const user = await prisma.user.findUnique({
    where: { email: String(email || "").toLowerCase() },
  });
  if (!user) return fail("Invalid code", 400);

  const result = await consumeOtp(user.id, "FORGOT_PASSWORD", otp);
  if (result.error) return fail(result.error, result.status);

  // Hand back a short-lived signed ticket so reset cannot be called blindly.
  const resetTicket = jwt.sign(
    { userId: user.id, scope: "password_reset" },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  return ok({ message: "OTP verified successfully", resetTicket });
};

// ----- reset password -----
const resetPassword = async (email, newPassword, resetTicket) => {
  const user = await prisma.user.findUnique({
    where: { email: String(email || "").toLowerCase() },
  });
  if (!user) return fail("User not found", 404);

  // Require the ticket minted by verifyResetOtp.
  try {
    const payload = jwt.verify(resetTicket || "", process.env.JWT_SECRET);
    if (payload.scope !== "password_reset" || payload.userId !== user.id) {
      return fail("Reset session is invalid. Please verify the code again", 401);
    }
  } catch {
    return fail("Reset session expired. Please verify the code again", 401);
  }

  if (!validatePassword(newPassword)) {
    return fail(PASSWORD_MESSAGE, 422);
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Revoke all refresh tokens so existing sessions are invalidated.
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await audit(user.id, "PASSWORD_RESET");

  return ok({ message: "Password reset successfully" });
};

// ----- resend OTP -----
const resendUserOtp = async (email, purpose = "REGISTER") => {
  const user = await prisma.user.findUnique({
    where: { email: String(email || "").toLowerCase() },
  });
  if (!user) return fail("User not found", 404);

  const issued = await issueOtp(user.id, purpose);
  if (issued.error) return fail(issued.error, 429);

  await sendOtpEmail(user.email, issued.otp, purpose);

  return ok(withDevOtp({ message: "OTP resent successfully" }, issued.otp));
};

// ----- refresh access token -----
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) return fail("Refresh token required", 401);

  const savedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: { user: true },
  });

  if (
    !savedToken ||
    savedToken.revokedAt ||
    savedToken.expiresAt <= new Date() ||
    savedToken.user.status !== "ACTIVE"
  ) {
    return fail("Invalid refresh token", 401);
  }

  return ok({ token: signAccessToken(savedToken.user) });
};

// ----- logout -----
const logoutUser = async (userId, refreshToken) => {
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { userId, tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  await audit(userId, "LOGOUT");
  return ok({ message: "Logout successful" });
};

module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendUserOtp,
  refreshAccessToken,
  logoutUser,
};
