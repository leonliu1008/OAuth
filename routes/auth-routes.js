const router = require("express").Router();
const { profile } = require("console");
const passport = require("passport");

router.get("/login", (req, res) => {
  return res.render("login");
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  return res.redirect("/profile");
});

module.exports = router;
