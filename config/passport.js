const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");

passport.serializeUser((user, done) => {
  //user = 下面讀到資料庫的user
  console.log("serialize使用者...");
  // console.log(user);
  done(null, user.id); //將mongoDB的id,存在session
  // 並且將id簽名後,以cookie的形式給使用者
});

passport.deserializeUser(async (_id, done) => {
  console.log("deserialize使用者...將serialize儲存的id,去找到資料庫內的資料");
  let foundUser = await User.findOne({ _id });
  done(null, foundUser); // 將req.user這個屬性設定設定為foundUser
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect", //已授權的重新導向 URI(在google cloud設定)
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("進入GoogleStrategy的區域");
      // console.log(profile);
      // console.log("=============================");
      let foundUser = await User.findOne({ googleID: profile.id }).exec(); // 檢查是否有存過ID
      // console.log(foundUser);
      if (foundUser) {
        console.log("使用者已經註冊過。無須存入資料庫");
        done(null, foundUser); // 會執行上面的passport.serializeUser
      } else {
        try {
          console.log("偵測到新用戶。須存入資料庫");
          let newUser = new User({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value,
          });
          let savedUser = await newUser.save();
          console.log("成功創見新用戶");
          done(null, savedUser); // // 會執行上面的passport.serializeUser
        } catch (e) {
          console.log("創見失敗");
        }
      }
    }
  )
);
