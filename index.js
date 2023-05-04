const express = require("express");
const path = require("path");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log("profile", profile);
  done(null, profile);
}

passport.use(
  new Strategy(
    {
      clientID: config.CLIENT_ID,
      callbackURL: "/auth/google/callback",
      clientSecret: config.CLIENT_SECRET,
    },
    verifyCallback
  )
);

const app = express();
app.use(passport.initialize());

function checkLoggedIn(req, res, next) {
  const loggedIn = true;
  if (!loggedIn) {
    return res.status(401).json({
      error: "You must log in ",
    });
  }
  next();
}
app.get("/failure", (req, res) => {
  res.send("Failed to log in !");
});

app.get("/auth/google", passport.authenticate("google", { scope: ["email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: false,
  }),
  (req, res) => {
    console.log("Google Called Us Back !");
  }
);

app.get("/auth/logout", (req, res) => {});

app.get("/secret", checkLoggedIn, (req, res) => {
  res.send("Your secret code is 125");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
