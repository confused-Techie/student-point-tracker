const ejs = require("ejs");
const path = require("node:path");

module.exports = {
  docs: {
    summary: "Individual Student view."
  },
  endpoint: {
    endpointKind: "raw",
    method: "GET",
    paths: [ "/student/:id" ],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff"
    },
    login: true
  },
  params: {
    id: (context, req) => { return context.query.id(req); }
  },

  async logic(req, res, context) {

    const params = {
      id: context.query.id(req),
      user: context.query.user(req)
    };

    // Determine the permissions of this user
    // The permissions mean the following:
    // user - Unauthenticated, or no declared permissions. Only read
    // admin - Is a declared administrator. Points:write
    // student - Is the student who owns the current student page. Duck:write
    let permLevel = "user";

    const admin = context.auth.isAdmin(params.user, context);

    if (admin.ok) {
      permLevel = "admin";
    }

    const ownership = context.auth.ownership(params.user, params.id, context);

    if (ownership.ok) {
      permLevel = "student";
    }

    // Lets get our student data
    let student = await context.database.getStudentByID(params.id);

    if (!student.ok) {
      // TODO: Render a fail EJS template
    }

    let studentPoints = await context.database.getPointsByStudentID(params.id);

    if (!studentPoints.ok && studentPoints.short !== "not_found") {
      // TODO: Render a fail EJS template
    }

    if (studentPoints.short === "not_found") {
      // Ensure to set to an empty array
      studentPoints.content = [];
    }

    // TODO: This would be a good time to generate any cool facts about the current users points

    const template = await ejs.renderFile("./views/pages/student.ejs",
      {
        name: context.config.SITE_NAME,
        student: student.content,
        points: studentPoints.content,
        presets: context.getPresets(),
        duck_items: context.ducks.generateDuckOpts(
          context.ducks.parseDuckUnlockString(student.content.duck_unlocked),
          student.content.duck_string
        ),
        pointChips: context.config.POINT_CHIPS,
        perms: permLevel
      },
      {
        views: [ path.resolve("./views") ]
      }
    );

    res.set("Content-Type", "text/html");
    res.status(200).send(template);
    return;
  }
};
