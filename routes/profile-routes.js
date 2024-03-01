const router = require("express").Router();

router.get("/", (req, res) => {
  return res.render("profile");
});

module.exports = router;
