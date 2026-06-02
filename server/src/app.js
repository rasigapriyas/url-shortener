// bring express package into file
const express = require("express");
// express creates server
const app = express();
// someone visit "/" send a response
app.get("/", (req, res) => {
  res.send("URL Shortener API Running");
});
//  server runs on 
const PORT = 5000;
// start server and wait for req
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});