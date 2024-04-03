const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const config = require("./config.js")();

module.exports = function getPresets() {
  let data = null;
  let defaultData = { add: [], remove: [] };

  try {
    if (!fs.existsSync(path.join(config.RESOURCE_PATH, "point_presets.yaml"))) {
      return defaultData;
    }

    let fileContent = fs.readFileSync(
      path.join(config.RESOURCE_PATH, "point_presets.yaml"),
      "utf8"
    );

    data = yaml.load(fileContent);
  } catch (err) {
    console.error(err);
  }

  if (data === null) {
    return defaultData;
  }

  return data;
};
