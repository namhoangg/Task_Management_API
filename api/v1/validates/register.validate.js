module.exports = (req, res, next) => {
  if (!req.body.fullName) {
    return res.status(400).send({ message: "Vui lòng cung cấp họ tên" });
  }
  if (!req.body.email) {
    return res.status(400).send({ message: "Vui lòng cung cấp email" });
  }
  if (!req.body.password) {
    return res.status(400).send({ message: "Vui lòng cung cấp mật khẩu" });
  }
  if (req.body.password.length < 6) {
    return res
      .status(400)
      .send({ message: "Mật khẩu phải có ít nhất 6 kí tự" });
  }
  next();
};
