// Minifies all client side JS and CSS

const fs = require("fs");
const path = require("path");
const { minify } = require("terser");
const CleanCSS = require("clean-css");
const less = require("less");
const assets = require("../package.json").assets;
const config = require("../src/config.js")();

const TERSER_OPTS = {
  sourceMap: true,
};

const CLEANCSS_OPTS = {
  sourceMap: true,
};

const LESS_OPTS = {};

async function mini(filePath, outPath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Unable to locate: '${filePath}'`);
    return;
  }

  const code = fs.readFileSync(filePath, { encoding: "utf8" });
  const filePathParts = path.parse(filePath);

  if (filePathParts.ext === ".js") {
    const result = await minify(code, TERSER_OPTS);

    // now to write to disk
    let minName = `${filePathParts.name}.min.js`;
    let mapName = `${filePathParts.name}.map.js`;

    // Add the source map key to the bottom of the minified JS file
    result.code += `\n//# sourceMappingURL=${config.SERVER_URL}/${mapName}`;

    fs.writeFileSync(path.join(outPath, minName), result.code, {
      encoding: "utf8",
    });
    fs.writeFileSync(path.join(outPath, mapName), result.map, {
      encoding: "utf8",
    });
  } else if (filePathParts.ext === ".css") {
    const result = new CleanCSS(CLEANCSS_OPTS).minify(code);

    let minName = `${filePathParts.name}.min.css`;
    let mapName = `${filePathParts.name}.map.css`;

    result.sourceMap.setSourceContent(
      `${filePathParts.name}${filePathParts.ext}`,
      code
    );

    let sourceMap = result.sourceMap.toString();

    fs.writeFileSync(path.join(outPath, minName), result.styles, {
      encoding: "utf8",
    });
    fs.writeFileSync(path.join(outPath, mapName), sourceMap, {
      encoding: "utf8",
    });
  } else if (filePathParts.ext === ".less") {
    const result = await less.render(code, LESS_OPTS);

    let newName = `${filePathParts.name}.css`;

    let newPath = path.join(outPath, newName);

    fs.writeFileSync(newPath, result.css, { encoding: "utf8" });

    // Then because we don't want just the CSS, we need to manually call for the CSS file
    await mini(newPath, outPath);
  } else {
    console.warn(`Unable to support: '${filePath}' extension!`);
    return;
  }
}

// (async () => {
//
//   // Now we can call this function for each of our entries
//   for (const asset in assets.files) {
//     let fileOut = assets.files[asset].output ?? assets.output;
//     await mini(assets.files[asset].source, fileOut);
//   }
//
// })();

module.exports = async () => {
  // Now we can call this function for each of our entries
  for (const asset in assets.files) {
    let fileOut = assets.files[asset].output ?? assets.output;
    await mini(assets.files[asset].source, fileOut);
  }
};
