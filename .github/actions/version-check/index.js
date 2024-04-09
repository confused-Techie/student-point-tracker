// Here we will compare the current package.json version to an older one
// To determine if the application has been updated in CI
const cp = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const ghcore = require("@actions/core");

// Set our defaults in the event anything fails below
ghcore.setOutput("changed", "false");
ghcore.setOutput("version", "");

let verbose = ghcore.getInput("debug", { required: false }) ?? false;

if (typeof verbose === "string") {
  if (verbose === "true") {
    verbose = true;
  } else if (verbose === "false") {
    verbose = false;
  }
}

// Lets first find our common ancestor commit
// This lets us determine the commit where the branch or fork departed from
const commonAncestorCmd = cp.spawnSync("git", [ "merge-base", "origin/main", "HEAD^" ]);

if (commonAncestorCmd.status !== 0 || commonAncestorCmd.stderr.toString().length > 0) {
  ghcore.error("Git command has failed!");
  ghcore.error("git merge-base origin/main HEAD^");
  ghcore.error(commonAncestorCmd.stderr.toString());
  ghcore.setFailed("Unable to determine the last good commit of the repository!");
  process.exit(1);
}

const commit = commonAncestorCmd.stdout.toString().trim();

if (verbose) {
  console.log(`Common Ancestor Commit: '${commit}'`);
}

const cmd = cp.spawnSync("git", [ "diff", "--name-only", "-r", "HEAD", commit ]);

if (cmd.status !== 0 || cmd.stderr.toString().length > 0) {
  ghcore.error("Git Command has Failed!");
  ghcore.error(`git diff --name-only -r HEAD ${commit}`);
  ghcore.error(cmd.stderr.toString());
  ghcore.setFailed("Unable to determine the file names changed on the last commit of this repository!");
  process.exit(1);
}

const changedFiles = cmd.stdout.toString().split("\n");
// This gives us an  array of the name and path of every single changed file from the last two
// commits. Now to check if there's any changes we care about.

if (verbose) {
  console.log("Array of changed files between commits:");
  console.log(changedFiles.join(", "));
}

const packageJsons = changedFiles.filter(element => element.endsWith("package.json"));

if (packageJsons.length === 0) {
  // No package.json found
  ghcore.info("No package.json file has been found with changes.");
  process.exit(0);
}

// Now for every single package.json we found (hopefully one) we will check it's
// version compared to our current version.

for (const packFile of packageJsons) {
  // Ignore files that have been deleted or moved
  if (!fs.existsSync(packFile)) {
    ghcore.info(`Skipping file that no longer exists: ${packFile}`);
    continue;
  }

  const packFileData = JSON.parse(fs.readFileSync(packFile), { encoding: "utf8" });

  if (packFileData.name !== "student-point-tracker") {
    // ignore any other package.json's we find other than the namesake repo
    ghcore.info(`Skipping other package.json found for: ${packFileData.name}`);
    continue;
  }

  // Now we need to find out the old version
  const getPrevFile = cp.spawnSync("git", [ "show", `${commit}:./${packFile}` ]);

  if (getPrevFile.status !== 0 || getPrevFile.stderr.toString().length > 0) {
    // This can fail for two major reasons
    // 1. The "git show" command has returned an error code other than "0", failing.
    // 2. This is a new file, and it failed to find an earlier copy (whcih didn't exist)
    // So that we don't fail brand new files, which shouldn't happen in this case,
    // we will manually check number 2
    if (getPrevFile.stderr.toString().includes("exists on disk, but not in")) {
      // Looks like this file is new. Skip this check
      if (verbose) {
        console.log(`Looks like this file is new '${packFile}'`);
        continue;
      }
    }

    ghcore.error("Git command failed!");
    ghcore.error(`'git show ${commit}:./${packFile}'`);
    ghcore.error(getPrevFile.stderr.toString());
    ghcore.setFailed("Unable to view the file prior to the last changes!");
    process.exit(1);
  }

  const oldContents = JSON.parse(getPrevFile.stdout.toString());

  const oldVer = oldContents.version;
  const curVer = packFileData.version;

  if (oldVer === curVer) {
    // There has been zero change between versions. We don't need to do anything else
    ghcore.info(`No change between versions '${oldVer}'...'${curVer}'`);
    continue;
  } else {
    // The version has changed!
    // We could use the 'semver' module to validate or do accurate comparisons, especially to find
    // the type of change, but that may be to come. For now, lets provide the data we found
    ghcore.info(`Version has been updated! From '${oldVer}' to '${curVer}'`);

    // Set our outputs
    ghcore.setOutput("changed", "true");
    ghcore.setOutput("version", curVer);
  }
}
