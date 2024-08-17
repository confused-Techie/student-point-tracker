module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageReporters: ["text", "clover"],
  coveragePathIgnorePatterns: [
    "<rootDir>/test/**",
    "<rootDir>/node_modules/**",
  ],
  projects: [
    {
      displayName: "Unit",
      setupFilesAfterEnv: ["<rootDir>/test/helpers/expect_setup.js"],
      testMatch: ["<rootDir>/test/unit/*.test.js"],
    },
    {
      displayName: "Integration",
      globalSetup: "<rootDir>/node_modules/@databases/pg-test/jest/globalSetup",
      globalTeardown:
        "<rootDir>/node_modules/@databases/pg-test/jest/globalTeardown",
      setupFilesAfterEnv: [
        "<rootDir>/test/helpers/db_setup.js",
        "<rootDir>/test/helpers/global_setup.js",
        "<rootDir>/test/helpers/expect_setup.js",
      ],
      testMatch: [
        "<rootDir>/test/http/*.test.js",
        "<rootDir>/test/database/*.test.js",
        "<rootDir>/test/tasks/*.test.js",
      ],
    },
  ],
};
