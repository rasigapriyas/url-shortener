// jwt package
const jwt = require("jsonwebtoken");

// verify jwt token
const authenticate = (req, res, next) => {

  // get auth header
  const authHeader =
    req.headers.authorization;

  // token missing
  if (!authHeader) {
    return res.status(401).json({
      message: "Token required",
    });
  }

  // remove bearer text
  const token =
    authHeader.split(" ")[1];

  try {

    // verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // attach user to request
    req.user = decoded;

    // move to next middleware
    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid token",
    });

  }

};

// export middleware
module.exports = authenticate;