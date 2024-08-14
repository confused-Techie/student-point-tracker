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

  const builtInTaskHandler = async (scriptSrc) => {
    try {
      const mod = require(scriptSrc);
      const res = await mod(require("../context.js"), config);
      taskRunStatus.exit_code = res;
    } catch (err) {
      console.error(`THe Task '${task.name}' seems to have crashed!`);
      console.error(err);
      taskRunStatus.exit_code = 1;
      taskRunStatus.exit_details = err;
    }
    return;
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
    case "attendance.DailyBonus": {
      await builtInTaskHandler("./attendance-dailyBonus.js");
      break;
    }
    case "attendance.DailyPenalty": {
      await builtInTaskHandler("./attendance-dailyPenalty.js");
      break;
    }
    case "attendance.WeeklyBonus": {
      await builtInTaskHandler("./attendance-weeklyBonus.js");
      break;
    }
    case "jsScript": {
      const customScript = path.resolve(`${config.RESOURCE_PATH}/${task.file}`);
      await builtInTaskHandler(customScript);
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
