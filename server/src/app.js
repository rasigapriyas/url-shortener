// bring express package into file
const express = require("express");

// import auth routes
const authRoutes = require("./routes/auth.routes");

// express creates server
const app = express();

// parse incoming JSON requests into req.body
// middleware
app.use(express.json());

// mount auth routes at /api/auth
app.use("/api/auth", authRoutes);

// health check route
app.get("/", (req, res) => {
  res.send("URL Shortener API Running");
});

// server port
const PORT = 5000;

// start server and wait for requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});