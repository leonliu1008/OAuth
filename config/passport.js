/**
 * 1.進入GoogleStrategy的區域
 * 2.檢查使用者是否註冊(使用者已經註冊過。無須存入資料庫)
 * 3.serialize使用者...
 * 4.進入redirect區域
 * 5.deserialize使用者...將serialize儲存的id,去找到資料庫內的資料
 * 6.進入/profile
 */

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

//user = 下面(GoogleStrategy)讀到資料庫的user
passport.serializeUser((user, done) => {
  // 3.serialize使用者...
  console.log("serialize使用者...");
  // console.log(user);
  done(null, user.id); //將mongoDB的id,存在session
  // 並且將id簽名後,以cookie的形式給使用者
});

passport.deserializeUser(async (_id, done) => {
  // 5.deserialize使用者...將serialize儲存的id,去找到資料庫內的資料
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
      // 1.進入GoogleStrategy的區域
      console.log("進入GoogleStrategy的區域");
      // console.log(profile);
      // console.log("=============================");
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      // console.log(foundUser);
      // 2.檢查使用者是否註冊(使用者已經註冊過。無須存入資料庫)
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

/**
 * 1.login.ejs裡面的input標籤,name一定要設定好固定格式
 * name="username"
 * name="password"
 * 2. 這樣使用LocalStrategy,才可以得到Value
 */

passport.use(
  new LocalStrategy(async (username, password, done) => {
    let foundUser = await User.findOne({ email: username });
    if (foundUser) {
      let result = await bcrypt.compare(password, foundUser.password);
      if (result) {
        done(null, foundUser); // 這樣就可以把foundUser 帶到最上面的serializeUser
      } else {
        done(null, false);
      }
    } else {
      done(null, false); // 設定false代表沒被驗證成功
    }
  })
);
