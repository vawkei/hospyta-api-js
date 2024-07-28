const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//1. register==============================================================:
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Input fields shouldn't be empty" });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: "Password characters should be > 6" });
  }

  //const data = { name, email, password };

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const tempData = {
    name: name,
    email: email,
    password: hashedPassword,
    isRegistered: true,
  };

  try {
    const user = await User.create(tempData);
    res.status(201).json({ msg: "please login" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
//2. login================================================================ :
const login = async (req, res) => {
  const { email, password } = req.body;
  //console.log(email, password);

  if (!email || !password) {
    return res.status(400).json({ msg: "Input fields shouldn't be empty" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User doesn't exist" });
    }

    if (user.isVerified === false) {
      return res.status(401).json({ msg: "Please verify your email" });
    }

    const passwordValidity = async (incominPwd, pwInDB) => {
      const isValid = await bcrypt.compare(incominPwd, pwInDB);
      return isValid;
    };

    const validPassword = await passwordValidity(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET_V,
      { expiresIn: process.env.JWT_LIFETIME }
    );
    console.log("This is the token:", token);

    if (user && validPassword) {
      const oneDay = 1000 * 60 * 60 * 24;

      const { _id, name, email, role, phone, photo } = user;
      res.cookie("token", token, {
        path: "/",

        httpOnly: true,

        expires: new Date(Date.now() + oneDay),

        secure: true,

        sameSite: "none",
      });
      res.status(201).json({
        msg: "User loggedin",
        user: { _id, name, email, role, phone, photo },
      });
    }
  } catch (error) {
    console.log("Error:", error);
  }

  //res.send("<h1>Login route</h1>");
};

const logout = (req, res) => {
  try {
    res.cookie("token", " ", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({ msg: "User logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { register, login, logout };
