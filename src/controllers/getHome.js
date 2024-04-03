const ejs = require("ejs");
const path = require("node:path");

module.exports = {
  docs: {
    summary: "Home Webpage of the application.",
  },
  endpoint: {
    endpointKind: "raw",
    method: "GET",
    paths: ["/"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
    login: true,
  },

  async logic(req, res, context) {
    const params = {
      user: context.query.user(req),
    };

    // Lets determine if we should redirect a logged in student to their page
    if (
      typeof params.user?.email === "string" &&
      context.config.REDIRECT_STUDENTS
    ) {
      let studentId = params.user.email.replace(
        `@${context.config.DOMAIN}`,
        ""
      );

      const studentExists = context.database.getStudentByID(studentId);

      if (studentExists.ok) {
        // We can hijack checking for a successful response as knowing the student exists
        // If the db calls fails for any other reason we would incorrectly assume they don't exist
        res.redirect(`/student/${studentId}`);
      }
    }

    // Determine the permissions of this user
    // refer to `./getStudentId.js` for more info
    let permLevel = "user";

    const admin = context.auth.isAdmin(params.user, context);

    if (admin.ok) {
      permLevel = "admin";
    }

    // Since no resource is defined, it is pointless to determine user permission here
    // Although we may want to determine if we should suggest a redirect to the user's page.
    // This could be done by simply checking if this user is a student at all.

    const template = await ejs.renderFile(
      "./views/pages/home.ejs",
      {
        name: context.config.SITE_NAME,
        problem_url: context.config.REPORT_A_PROBLEM_URL,
        perms: permLevel,
        student: false, // Used to keep EJS from self destructing when including dialogs
        presets: context.getPresets(),
        pointChips: context.config.POINT_CHIPS,
        pageDescription: "Student Point Tracker Homepage.",
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
    console.log(req.user);

    res.set("Content-Type", "text/html");
    res.status(200).send(template);
    return;
  },
};
