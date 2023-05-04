// Import necessary packages
const express = require("express"); // Express.js web framework
const path = require("path"); // Path module for working with file paths
const passport = require("passport"); // Passport.js authentication library
const { Strategy } = require("passport-google-oauth20"); // Passport.js Google OAuth 2.0 authentication strategy
const cookieSession = require("cookie-session"); // Cookie session middleware for Express.js
const helmet = require("helmet"); // Helmet middleware for securing HTTP headers
require("dotenv").config(); // Load environment variables from .env file

// Set up port and configuration variables
const PORT = process.env.PORT || 5000; // Port to listen on (from environment variable or default to 5000)
const config = {
  CLIENT_ID: process.env.CLIENT_ID, // Google OAuth 2.0 client ID
  CLIENT_SECRET: process.env.CLIENT_SECRET, // Google OAuth 2.0 client secret
  COOKIE_KEY_1: process.env.COOKIE_KEY_1, // First key for cookie session middleware
  COOKIE_KEY_2: process.env.COOKIE_KEY_2, // Second key for cookie session middleware
};

// Define callback function for Passport.js authentication strategy
function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log("profile", profile); // Log user profile information to console
  done(null, profile); // Call done() function to complete authentication and pass user profile information to serializeUser()
}

// Configure Passport.js with Google OAuth 2.0 authentication strategy
passport.use(
  new Strategy(
    {
      clientID: config.CLIENT_ID, // Set Google OAuth 2.0 client ID
      callbackURL: "/auth/google/callback", // Set callback URL for Google OAuth 2.0 authentication
      clientSecret: config.CLIENT_SECRET, // Set Google OAuth 2.0 client secret
    },
    verifyCallback // Call verifyCallback() function to handle authentication
  )
);

// Serialize and deserialize user information for Passport.js
passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize user ID for storing in cookie
});
passport.deserializeUser((id, done) => {
  done(null, id); // Deserialize user ID from cookie
});

// Set up Express.js app with middleware
const app = express();
app.use(helmet()); // Secure HTTP headers with Helmet middleware

// Use cookie session middleware for authentication persistence
app.use(
  cookieSession({
    name: "session", // Set name of session cookie
    maxAge: 24 * 60 * 60 * 1000, // Set session cookie expiration time to 24 hours
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2], // Set keys for encrypting session cookie
  })
);

// Initialize Passport.js and use session middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware function to check if user is logged in
function checkLoggedIn(req, res, next) {
  const loggedIn = req.isAuthenticated() && req.user; // Check if user is authenticated and has user object
  if (!loggedIn) {
    return res.status(401).json({
      error: "You must log in ", // Send error message if user is not authenticated
    });
  }
  next();
}

// Route for failed login attempt

app.get("/failure", (req, res) => {
  res.send("Failed to log in !");
});

// Google OAuth 2.0 Authentication
app.get("/auth/google", passport.authenticate("google", { scope: ["email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
  }),
  (req, res) => {
    console.log("Google Called Us Back !");
  }
);

app.get("/auth/logout", (req, res) => {
  req.logout();
  return res.redirect("/");
});

// A protected route that requires authentication to access
app.get("/secret", checkLoggedIn, (req, res) => {
  res.send("Your secret code is 123456798");
});

// The default route, which sends the index.html file to the client
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
