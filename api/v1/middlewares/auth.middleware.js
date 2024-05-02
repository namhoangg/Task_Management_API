const User=require('../models/user.model');
module.exports.requireAuth = async (req, res, next) => {
  if (req.headers.authorization) {
    const tokenUser = req.headers.authorization.split(" ")[1];
    const user = await User.findOne({ tokenUser });
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).json({ code: 401, message: "Unauthorized" });
    }
    // next();
  } else {
    res.status(401).json({ code: 401, message: "Unauthorized" });
  }
};
