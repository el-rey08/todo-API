const usermodel = require("../model/model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
exports.adminAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({
        message: "authorization is required",
      });
    }
    const token = auth.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "invalide token",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await usermodel.findById(decodedToken.userId);
    if (!user.isAdmin) {
      res.status(403).json({
        message: "authentication failed: user not an admin",
      });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.json({
        message: "Error verifying user",
      });
    }
    res.status(500).json(error.message);
  }
};
