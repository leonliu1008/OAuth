const router = require("express").Router();
const Post = require("../models/post-model");

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    console.log("尚未登入");
    return res.redirect("/auth/login");
  }
};

router.get("/", authCheck, (req, res) => {
  // console.log(req.user);//deSerializeUser 已經找到
  // 6. 進入/profile
  console.log("/進入/profile");
  return res.render("profile", { user: req.user }); // req.user 是從deSerializeUser拿到
});

router.get("/post", authCheck, (req, res) => {
  return res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
});

module.exports = router;
