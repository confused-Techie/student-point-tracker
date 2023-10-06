const ejs = require("ejs");
const path = require("path");

module.exports = {
  docs: {
    summary: "Request the User to login."
  },
  endpoint: {
    endpointKind: "raw",
    method: "GET",
    paths: [ "/requestLogin" ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    }
  },
  params: {},

  async logic(req, res, context) {

    const template = await ejs.renderFile("./views/pages/requestLogin.ejs",
      {
        name: context.config.SITE_NAME
      },
      {
        views: [ path.resolve("./views") ]
      }
    );

    res.set("Content-Type", "text/html");
    res.status(200).send(template);
  }
};
