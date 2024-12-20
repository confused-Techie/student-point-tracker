const path = require("path");

const express = require("express");
const compression = require("compression");
const session = require("express-session");
const SessionFileStore = require("session-file-store")(session);
const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");
const Route = require("./route.js");

module.exports =
class Frontend {
  constructor(server) {
    this.server = server;

    this.app;
    this.routes = [];
    this.passport = passport;
    this.serve;
  }

  async initialize() {
    this.app = express();

    // Basic Setup
    this.app.use(compression());

    if (this.server.config.enableAuthentication) {
      // Authentication Setup
      this.app.use(
        session({
          secret: "test",
          resave: false,
          saveUninitialized: false,
          store: new SessionFileStore({
            path: path.join(this.server.config.resourcePath, "sessions"),
            ttl: this.server.config.sessionFileStoreTtl
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
            clientID: this.server.config.googleClientId,
            clientSecret: this.server.config.googleClientSecret,
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

            if (profile.emails[0].value.endsWith(this.server.config.domain)) {
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
    }

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

  route(obj) {
    // TODO maybe validate?
    for (const routePath in obj.paths) {
      this.routes.push(
        new Route({
          routePath: routePath,
          oapi: obj,
          express: this.app,
          server: this.server
        })
      );
    }
  }

  listen(port) {
    this.serve = this.app.listen(port, () => {
      this.server.log.notice(`Server Listening on port ${port}`);
    });
  }

  stop() {
    this.serve.close(() => {
      this.server.log.notice("HTTP Server Closed.");
    });
  }
}
