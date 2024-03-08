const router = require("express").Router();
const { profile, assert } = require("console");
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  // if (req.user) {
  //   console.log("存在");
  // } else {
  //   console.log("不存在");
  // }
  return res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.send(err);
    console.log("登出完成,回到首頁");
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", { user: req.user });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
  () => {
    console.log("進入google");
  }
);

router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  // 雖然在ejs(前端)已限制密碼長度,但無法防止Postman
  if (password.length < 8) {
    req.flash("error_msg", "密碼長度過短,至少8碼");
    return res.redirect("/auth/signup");
  }

  // 確認信箱是否被註冊過
  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "此信箱已被註冊。請使用其他信箱，或使用此信箱登入系統"
    );
    return res.redirect("/auth/signup");
  }

  // 註冊新的使用者(要先使用bcrypt 加密加鹽 雜湊)
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  req.flash("success_msg", "註冊成功!可以開始登入系統!");
  return res.redirect("/auth/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    // failureRedirect若登入失敗 會導向的route
    // failureFlash 會套在eq.flash("error");(內建的功能)
    // 登入成功才會執行(req,res)
    failureRedirect: "/auth/login",
    failureFlash: "登入失敗。帳號或密碼錯誤。",
  }),
  (req, res) => {
    return res.redirect("/profile");
  }
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  // console.log(req.user); // deSerializeUser 已經找到
  // 4.進入redirect區域
  console.log("進入redirect區域");
  return res.redirect("/profile");
});

module.exports = router;
