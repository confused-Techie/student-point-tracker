# Tasks

Tasks are a huge part of the configurability of SPT, since a task allows you to hook into the API of SPT or otherwise execute timed actions on the server.

Tasks are initially defined in the `app.yaml` configuration file. Where the `TASKS` key itself takes an array of task objects, each of which containing the following keys:

  * `name`: The human friendly name for the task.
  * `schedule`: This is when the task occurs.
  * `action`: This is the type of action this task is.
  * `file`: This is a file referenced for the task.

## Schedule

This is the time that the task will actually run.

Some premade options are:
  * `startup`: The task will run once during every startup of STP
  * `shutdown`: The task will run once during the shutdown of STP

Beyond the premade options, the schedule string can be any valid [Unix Crontab value](https://man7.org/linux/man-pages/man5/crontab.5.html). With some very minor [differences](https://www.npmjs.com/package/node-schedule) between what's officially supported on STP.

For example to run task every Friday at Midnight:

```yaml
schedule: "0 0 * * 5"
```

Or run a script everyday Monday - Friday at 5PM:

```yaml
schedule: "0 17 * * * 1-5"
```

## Action

The action property of a task describes what the task actually does.

The supported values are:
  * `importUsers`: This automatically triggers the import at the specified schedule.
  * `attendance.DailyBonus`: Provides a daily bonus of points based on attendance.
  * `attendance.DailyPenalty`: Provides a daily penalty of points based on attendance.
  * `attendance.WeeklyBonus`: Provides a weekly bonus of points based on attendance.
  * `jsScript`: This would trigger the running of a custom JavaScript file at the specified schedule.

## File

The meaning of the file entry changes based on which actions is occurring:

  * `action: importUsers`: Then the `file` references the file to be used to import users.
  * `action: jsScript`: Then the `file` references the JavaScript file to run.

## JavaScript Tasks

As mentioned above a Task can trigger a JavaScript file to be run.

To create a file to be run, you first need to export the function that will actually be run, like so:

```javascript
module.exports =
function main() {

}
```

The JavaScript function that's being exported also needs to accept it's only variable `context`, like so:

```javascript
module.exports =
function main(context) {

}
```

The `context` variable being passed is an object that will have access to nearly the entire STP application.
