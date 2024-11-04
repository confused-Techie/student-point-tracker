const path = require("path");

const express = require("express");
const compression = require("compression");
const session = require("express-session");
const SessionFileStore = require("session-file-store")(session);
const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");

module.exports =
class Frontend {
  constructor(server) {
    this.server = server;

    this.app;
    this.passport = passport;
  }

  async initialize() {
    this.app = express();

    // Basic Setup
    this.app.use(compression());

    // Authentication Setup
    this.app.use(
      session({
        secret: "test",
        resave: false,
        saveUninitialized: false,
        store: new SessionFileStore({
          path: path.join(this.server.config.RESOURCE_PATH, "sessions"),
          ttl: this.server.config.SESSION_FILE_STORE_TTL
        })
      })
    );

    this.app.use(this.passport.authenticate("session"));

    this.passport.serializeUser(function (user, cb) {
      process.nextTick(function () {
        cb(null, user);
        // This allows the user object to be available via req.session.passport.user
      });
    });

    this.passport.deserializeUser(function (user, cb) {
      process.nextTick(function () {
        return cb(null, user);
      });
    });

    this.passport.use(
      "google",
      new GoogleStrategy(
        {
          clientID: this.server.config.GOOGLE_CLIENT_ID,
          clientSecret: this.server.config.GOOGLE_CLIENT_SECRET,
          callbackURL: "/oauth2/redirect",
          scope: ["profile", "email", "openid"]
        },
        (issuer, profile, cb) => {
          if (
            !Array.isArray(profile.emails) ||
            typeof profile.emails[0]?.value !== "string"
          ) {
            return cb("Invalid email object retreived from Google.");
          }

          if (profile.emails[0].value.endsWith(this.server.config.DOMAIN)) {
            const usrObj = {
              issuer: issuer,
              id: profile.id,
              displayName: profile.displayName,
              first_name: profile.name.givenName,
              last_name: profile.name.familyName,
              email: profile.emails[0].value
            };

            return cb(null, usrObj);
          } else {
            console.error(profile);
            return cb(
              `Bad email domain attempted to be used during login! '${profile.emails[0].value}'`
            );
          }
        }
      )
    );

    this.setupAuthEndpoints();
  }

  setupAuthEndpoints() {
    this.app.get("/login", this.passport.authenticate("google"));

    this.app.get(
      "/oauth2/redirect",
      this.passport.authenticate("google", {
        successRedirect: "/",
        failureRedirect: "/requestLogin"
      })
    );
  }

  // The method called to provide an OpenAPI object specification to the frontend
  // that's intended to then be configured on our instance of ExpressJS
  route(obj) {
    // Since the logic required here is far to great for our purposes, we will instead
    // shell this out to another module.
    
  }
}
