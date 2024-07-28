const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      msg: "You are not authorized to access this route. Please login",
    });
  }
  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET_V);

  req.user = { userId: verifiedToken.userId, name: verifiedToken.name };
  console.log(req.user);
  next();
};

module.exports = { authenticateUser };
