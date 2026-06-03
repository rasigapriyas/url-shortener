const validator = require("validator");

const SHORT_CODE_LENGTH = 7;
const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/;

const isValidUrl = (value) =>
  typeof value === "string" &&
  validator.isURL(value, {
    require_protocol: true,
    protocols: ["http", "https"],
    require_valid_protocol: true,
  });

const normalizeUrl = (value) => value.trim();

const isValidAlias = (value) =>
  !value || ALIAS_PATTERN.test(value);

const randomCode = () => {
  const alphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";

  for (let i = 0; i < SHORT_CODE_LENGTH; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
};

const parseClient = (userAgent = "") => {
  const ua = userAgent.toLowerCase();

  const browser = ua.includes("edg/")
    ? "Edge"
    : ua.includes("chrome/")
      ? "Chrome"
      : ua.includes("firefox/")
        ? "Firefox"
        : ua.includes("safari/")
          ? "Safari"
          : "Unknown";

  const os = ua.includes("windows")
    ? "Windows"
    : ua.includes("android")
      ? "Android"
      : ua.includes("iphone") || ua.includes("ipad")
        ? "iOS"
        : ua.includes("mac os")
          ? "macOS"
          : ua.includes("linux")
            ? "Linux"
            : "Unknown";

  const device =
    ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")
      ? "Mobile"
      : ua.includes("ipad") || ua.includes("tablet")
        ? "Tablet"
        : "Desktop";

  return {
    browser,
    os,
    device,
  };
};

const isExpired = (url) =>
  Boolean(url.expiresAt && url.expiresAt <= new Date());

module.exports = {
  isValidUrl,
  normalizeUrl,
  isValidAlias,
  randomCode,
  parseClient,
  isExpired,
};
