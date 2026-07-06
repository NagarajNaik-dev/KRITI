const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const getGooglePhotoUrl = async (accessToken, profile) => {
  if (accessToken) {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.picture) return data.picture;
      }
    } catch {
      // Fall back to profile fields below.
    }
  }

  return profile.photos?.[0]?.value || profile._json?.picture || '';
};

// Passport serialization is required so the user can be stored in session state.

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configure Google OAuth strategy for social login.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Google account has no email'), null);
        }

        const photoUrl = await getGooglePhotoUrl(accessToken, profile);
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          if (photoUrl) user.avatar = photoUrl;
          await user.save();
        } else {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            if (photoUrl) user.avatar = photoUrl;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName || email.split('@')[0],
              email,
              avatar: photoUrl,
            });
          }
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
