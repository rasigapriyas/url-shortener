// load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const urlRoutes = require("./routes/url.routes");
const { redirect } = require("./controllers/redirect.controller");

const app = express();

// behind a proxy (Render/Railway/Nginx) so rate-limit + IP capture work
app.set("trust proxy", 1);

// security headers
app.use(helmet());

// request logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS — allow the configured client origin(s)
const allowedOrigins = (
  process.env.CLIENT_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser tools (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// parse JSON bodies
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);

// health check
app.get("/", (req, res) => res.send("URL Shortener API Running"));

// public redirect by short code
app.get("/:shortCode", redirect);

// 404 for anything unmatched
app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// centralized error handler — last middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    message:
      status >= 500 ? "Something went wrong. Please try again." : err.message,
  });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
