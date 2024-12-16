const { performance } = require("node:perf_hooks");

module.exports =
class CallStack {
  contructor() {
    this.calls = {};

    this.initialize();
  }

  initialize() {
    this.addCall("init", {});
  }

  addCall(id, content) {
    this.calls[id] = {
      content: this.sanitize(content),
      time: performance.now(),
    };
  }

  // Attempts to remove any sensitive data that may be found within
  sanitize(content, depth=0) {
    const badKeys = [
      "token",
      "password",
      "pass",
      "auth",
      "secret",
      "passphrase",
      "card"
    ];
    // https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#githubs-token-formats
    const githubTokenReg = /(?:gho_|ghp_|github_pat_|ghu_|ghs_|ghr_)/;
    const hideString = "*****";
    let outContent = {};
    let type = typeof content;

    // Since JavaScript `typeof` will assign an array as "object" as well as null
    // we will extend this typeof check to add those as different types, to ease
    // the complexity of the below switch statement
    if (type === "object") {
      if (Array.isArray(content)) {
        type = "array";
      } else if (content === null) {
        type = "null";
      }
    }

    switch(type) {
      case "object":
        for (const key in content) {
          // Match different possible keys that represent sensitive data
          if (badKeys.includes(key)) {
            outContent[key] = hideString;
          } else {
            if (depth > 15) {
              // TODO dirty hack to avoid hitting callstack when parsing large
              // redudent bodies
              // pulsar-edit/package-backend#252
              outContent[key] = content[key];
              break;
            }
          }
        }
        break;
      case "string":
        // Match different strings of sensitive data
        if (githubTokenReg.test(content)) {
          outContent = hideString;
        } else {
          // More strings to test can be added here
          outContent = content;
        }
        break;
      case "array":
        outContent = [];
        for (let i = 0; i < content.length; i++) {
          outContent.push(this.sanitize(content[i]));
        }
        break;
      default:
        outContent = content;
    }

    return outContent;
  }
}
