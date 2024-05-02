const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const generateToken = require("../helpers/generateToken");
const ForgotPassword = require("../models/forgot-password.model");
const mailHelper = require("../helpers/sendMail");
const express = require("express");
module.exports.register = async (req, res) => {
  try {
    const existEmail = await User.findOne({
      email: req.body.email,
      deleted: false,
    });
    if (existEmail) {
      return res.status(400).send({ message: "Email đã tồn tại" });
    }
    const infoUser = {
      fullName: req.body.fullName,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      tokenUser: generateToken.generateToken(20),
    };
    const user = new User(infoUser);
    await user.save();
    res.cookie("tokenUser", user.tokenUser, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.status(201).send({
      code: 201,
      message: "Tạo tài khoản thành công",
      tokenUser: user.tokenUser,
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
};
//[POST] /api/v1/users/login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.json({
        code: 400,
        message: "Tài khoản không tồn tại",
      });
    } else {
      const checkPassword = await bcrypt.compare(password, user.password);
      if (checkPassword) {
        res.cookie("tokenUser", user.tokenUser, {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        res.json({
          code: 200,
          message: "Đăng nhập thành công",
          tokenUser: user.tokenUser,
        });
      } else {
        res.json({
          code: 400,
          message: "Mật khẩu không đúng",
        });
      }
    }
  } catch (error) {
    res.json({
      code: 500,
      message: error.message,
    });
  }
};
//[POST] /api/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const otp = generateToken.generateOTP(6);
      const isExist = await ForgotPassword.findOne({ email });
      if (isExist) {
        res.json({
          code: 400,
          message: "Vui lòng gửi lại sau 1 phút",
        });
        return;
      }
      const forgot = new ForgotPassword({
        email,
        otp,
        expireAt: Date.now()+180000,
      });
      await forgot.save();
      const subject = "Tính năng quên mật khẩu: ";
      const html = `<h1>Mã OTP của bạn là ${otp}</h1>`;
      await mailHelper.sendMail(email, subject, html);
      res.json({
        code: 200,
        email: email,
        message: "Đã gửi mã OTP cho khách hàng",
      });
    } else {
      res.json({
        code: 400,
        message: "Email không tồn tại",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      code: 500,
      message: "Server error",
    });
  }
};
//[POST] /api/users/password/otp
module.exports.otp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const forgot = await ForgotPassword({ email, otp });
    if (forgot) {
      const user = await User.findOne({ email }).select("tokenUser");
      await ForgotPassword.deleteOne({ email });
      res.cookie("tokenUser", user.tokenUser, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      res.json({
        code: 200,
        message: "OTP correct",
        tokenUser: user.tokenUser,
      });
    } else {
      res.json({
        code: 400,
        message: "OTP not correct",
      });
    }
  } catch (error) {
    res.json({
      code: 500,
      message: "Server error",
    });
  }
};
//[POST] /api/users/password/reset
module.exports.reset = async (req, res) => {
  try {
    const tokenUser = req.user.tokenUser;
    const { password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    try {
      await User.findOneAndUpdate({ tokenUser }, { password: hashPassword });
      res.json({
        code: 200,
        message: "Reset password success",
      });
    } catch {
      res.json({
        code: 400,
        message: "Reset password failed",
      });
    }
  } catch (error) {
    res.json({
      code: 500,
      message: error.message,
    });
  }
};
//[POST] /api/users/info
module.exports.info = async (req, res) => {
  try {
    const { tokenUser } = req.user;
    const user = await User.findOne({ tokenUser }).select(
      "-password -tokenUser"
    );
    res.json({
      code: 200,
      data: user,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "Server error",
    });
  }
};
//[GET] /api/users/list
module.exports.list = async (req, res) => {
  try {
    const users = await User.find({ deleted: false }).select(
      "_id fullName email"
    );
    res.json({
      code: 200,
      data: users,
    });
  } catch (error) {
    res.json({
      code: 500,
      message: "Server error",
    });
  }
};
