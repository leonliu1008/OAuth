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

router.get("/", authCheck, async (req, res) => {
  // console.log(req.user);//deSerializeUser 已經找到
  // 6. 進入/profile
  let postFound = await Post.find({ author: req.user._id });
  // 因為在下面post的時候已經先設定author: req.user._id,
  // 所以可以找到post的人與作者是相同的人
  console.log("/進入/profile");
  return res.render("profile", { user: req.user, posts: postFound }); // req.user 是從deSerializeUser拿到
});

router.get("/post", authCheck, (req, res) => {
  return res.render("post", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;

  if (title.length < 1 || content.length < 6) {
    req.flash("error_msg", "標題不可少於1個字體,內容不可少於6個字");
    return res.redirect("/profile/post");
  }
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    return res.redirect("/profile");
  } catch (e) {
    req.flash("error_msg", "標題與內容都需要填寫。");
    return res.redirect("/profile/post");
  }
});

module.exports = router;
