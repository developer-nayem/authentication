require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  (accessToken, refreshToken, profile, cb) => {
    User.findOne({googleId: profile.id}, (err, user) => {
        if (err) return cb(err, null);
        if (!user) {
            let newUser = new User({
                googleId: profile.id,
                username: profile.displayName,
            })
            newUser.save();
            return cb(null, newUser);
        } else {
            return cb(null, user);
        }
    });
  }
));

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
})