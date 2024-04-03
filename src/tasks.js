const path = require("path");
const schedule = require("node-schedule");
const config = require("./config.js")();

const SHUTDOWN_TASKS = [];
const TASK_RUNS = [];

async function init() {
  // The main runner, and function in charge of initializing all system tasks.

  for (const task of config.TASKS) {
    if (!validateTask(task)) {
      console.error("Invalid task syntax found!");
      console.error(task);
    }

    console.log(`Setting up: '${task.name}'`);

    switch (task.schedule) {
      case "startup": {
        await executeTask(task);
        break;
      }
      case "shutdown": {
        SHUTDOWN_TASKS.push(task);
        break;
      }
      default: {
        const job = schedule.scheduleJob(
          task.schedule,
          async function (task) {
            await executeTask(task);
          }.bind(null, task)
        );
      }
    }
  }
}

async function executeTask(task) {
  let taskRunStatus = {
    runtime: new Date().toISOString(),
    exit_code: null,
    exit_details: null,
    task_details: task,
  };

  if (!validateTask(task)) {
    console.error("Invalid task syntax found!");
    console.error(task);

    taskRunStatus.exit_code = 255;
    taskRunStatus.exit_details = `Task failed Validation! -> ${task}`;
  }

  console.log(`Executing: '${task.name}'`);

  switch (task.action) {
    case "importUsers": {
      const importer = require("./importer.js");

      await importer(task.file);

      taskRunStatus.exit_code = 0;
      taskRunStatus.exit_details = "Kicked off 'importer' task.";
      break;
    }
    case "jsScript": {
      try {
        const customScript = require(
          path.resolve(`${config.RESOURCE_PATH}/${task.file}`)
        );
        let ret = await customScript(require("./context.js"));

        taskRunStatus.exit_code = ret;
      } catch (err) {
        console.error(`The Task ${task.name} seems to have crashed!`);
        console.error(err);
        taskRunStatus.exit_code = 1;
        taskRunStatus.exit_details = err;
      }
      break;
    }
    default: {
      console.error(`Unrecognized task: '${task.action}' in '${task.name}'!`);
      taskRunStatus.exit_code = 2;
      taskRunStatus.exit_details = `Unrecognized task! -> ${task}`;
      break;
    }
  }

  // Add the run info to our shared array
  TASK_RUNS.push(taskRunStatus);
}

function validateTask(task) {
  if (typeof task.name !== "string" && typeof task.schedule !== "string") {
    return false;
  } else {
    return true;
  }
}

module.exports = {
  SHUTDOWN_TASKS,
  TASK_RUNS,
  init,
  executeTask,
};
