// bring express package into file
const express = require("express");

// import auth routes
const authRoutes = require("./routes/auth.routes");

// import url routes
const urlRoutes = require("./routes/url.routes");

// import redirect controller
const {
  redirect,
} = require("./controllers/redirect.controller");

// express creates server
const app = express();

// parse incoming JSON requests into req.body
app.use(express.json());

// mount auth routes at /api/auth
app.use("/api/auth", authRoutes);

// mount url routes at /api/url
app.use("/api/url", urlRoutes);

// health check route
app.get("/", (req, res) => {
  res.send("URL Shortener API Running");
});

// public redirect route
app.get("/:shortCode", redirect);

// server port
const PORT = 5000;

// start server and wait for requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});