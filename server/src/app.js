// bring express package into file
const express = require("express");

// cors package
const cors = require("cors");

// import auth routes
const authRoutes =
  require("./routes/auth.routes");

// import url routes
const urlRoutes =
  require("./routes/url.routes");

// import redirect controller
const {
  redirect,
} = require(
  "./controllers/redirect.controller"
);

// express creates server
const app = express();

// enable cors
app.use(
  cors({
    origin:
      "http://localhost:5173",
  })
);

// parse incoming JSON requests
app.use(
  express.json()
);

// mount auth routes
app.use(
  "/api/auth",
  authRoutes
);

// mount url routes
app.use(
  "/api/url",
  urlRoutes
);

// health check route
app.get("/", (req, res) => {
  res.send(
    "URL Shortener API Running"
  );
});

// public redirect route
app.get(
  "/:shortCode",
  redirect
);

// server port
const PORT = 5000;

// start server
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});