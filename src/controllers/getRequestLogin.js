const ejs = require("ejs");
const path = require("path");

module.exports = {
  docs: {
    summary: "Request the User to login.",
  },
  endpoint: {
    endpointKind: "raw",
    method: "GET",
    paths: ["/requestLogin"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {},

  async logic(req, res, context) {
    const template = await ejs.renderFile(
      "./views/pages/requestLogin.ejs",
      {
        name: context.config.SITE_NAME,
        problem_url: context.config.REPORT_A_PROBLEM_URL,
        pageDescription: "Student Point Tracker Login",
        utils: require("../ejs_utils.js"),
        footer: {
          name: context.config.FOOTER_ITEM_NAME,
          link: context.config.FOOTER_ITEM_LINK,
        },
      },
      {
        views: [path.resolve("./views")],
      }
    );

    res.set("Content-Type", "text/html");
    res.status(200).send(template);
  },
};
