/**
  This module exports all configuration changes and data needed for `spt`
  on top of DWSC.
*/

const passport = require("passport");
const GoogleStrategy = require("passport-google-oidc");
const session = require("express-session");
const SessionFileStore = require("session-file-store")(session);

module.exports = (server) => {
  server.config = {
    port: 8080,
    resourcePath: "./tmp",
    sessionFileStoreTtl: 9000,
    googleClientId: null,
    googleClientSecret: null,
    enableAuthentication: false,
    domain: ""
  };

  server.controllers = require("./api.js");

  server.globals.passport = passport;

  if (server.config.enableAuthentication) {
    configureAuth(server);
  }
};

function configureAuth(server) {
  const app = server.getExpressInstance();

  app.use(
    session({
      secret: "test",
      resave: false,
      saveUninitialized: false,
      store: new SessionFileStore({
        path: path.join(server.config.resourcePath, "session"),
        ttl: server.config.sessionFileStoreTtl
      })
    })
  );

  app.use(passport.authenticate("session"));

  passport.seializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, user);
      // This allows the user object to be available via req.session.passport.user
    });
  });

  passport.desializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });

  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: server.config.googleClientId,
        clientSecret: server.config.googleClientSecret,
        callbackURL: "/oauth2/redirect/google",
        scope: ["profile", "email", "openid"]
      },
      (issuer, profile, cb) => {
        if (
          !Array.isArray(profile.emails) ||
          typeof profile.emails[0]?.value !== "string"
        ) {
          return cb("Invalid email object retreived from Google.");
        }

        if (profile.emails[0].value.endsWith(server.config.domain)) {
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
          server.log.crit(profile);
          return cb(`Bad email domain attempted to be used during login! '${profile.emails[0].values}'`);
        }
      }
    )
  );
}
