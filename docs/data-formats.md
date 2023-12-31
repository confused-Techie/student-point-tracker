# Data Formats

Since there are quite a few moving pieces of data within this project, it's prudent to go ahead and document every single one of them, and how they are used.

## Config

The configuration of the entire application is contained within `app.yaml` at the root of the system.
An `app.example.yaml` is provided to help craft this file as needed.

### Tasks

Within your config you are able to define different tasks that should be executed within the system.

Every single task should contain the following properties:

* `name`: The human readable name for the task.
* `schedule`: When you'd like the task to execute.
* `action`: The action that should be taken during this task.

Many `action`s are built-in to make them easier, such as:

* `importUsers`: This task is able to preform an import of users into the database. It is required to also specify a `file` property, this file should be a CSV matching the "Student Import" section of data.
* `jsScript`: This task is able to load and run a custom JavaScript module. This would allow the most freedom to accomplish whatever is wanted. This module should export a single function, as the default export that accepts a single parameter `context`, this will be the context access to the entire internal API. As determined by `./src/context.js`.

There are also many supported values for the `schedule` such as:

* `startup`: This causes the task to run immediately on startup.
* `shutdown`: This causes the task to run once the application is shutting down. Keep in mind this task will run during any event that causes a shutdown. Including if the program has crashed, a successful run of this task is never guaranteed.

Otherwise, if you need more granular control over any task you'd like to schedule, nearly any cron job declaration is supported. Refer to [`node-schedule`](https://www.npmjs.com/package/node-schedule) for any unsupported features of cron.

But using cron means it'd be easy to schedule a task that runs every second, such as setting the `schedule` property to `*/10 * * * * *`.

## Student Import

The student import file is used (for now during startup) to import a CSV of users into the database.

This file should be located within the `storage` directory at the root of the repository, and titled `students.csv`.

This file, if found will be used to import a set of users directly into the database.

The delimiter used within this file can be set via the `app.yaml` configuration file with `CSV_DELIMITER`. By default this is `,`.

The columns of this CSV should be:

* `student_id`
* `first_name`
* `last_name`

An example of this data should look like so:

```csv
student_id, first_name, last_name
1, John, Smith
2, Jane, Smith
```

Optionally, you may include a `points` column and values, to initialize a student with that amount of points.

## Points Presets

To help your users avoid having to type out the same reason and point amount over and over, you are able to provide presets for this data, both for adding and removing points.

The file used to define these presets should be located within the `storage` directory, and titled `point_presets.yaml`.

This file, if found will be used to build the presets visible on this page.

An example of this file should look like so:

```yaml
add:
  - name: "Good Behavior"
    amount: 10
remove:
  - name: "Bad Behavior"
    amount: 10
    reason: "Disrupting Class"
```

As you can see the root objects of `add` and `remove` are used to define the presets for adding and removing points respectively.

Within each item's array are objects with the following properties:

* `name`: This is the name that will appear for the preset.
* `amount`: This is the amount of points that will be modified when selecting the preset.
* `reason`: This optional value is what will appear in the `reason` field during point modification. Omitting this value will use the `name` instead as the reason.

## Badges

In order to define and specify the badges that students can earn, this data is defined via the `./storage/badges.yaml` file, where much like our `tasks` we are able to define all aspects of our badges. Within a badges file will be the single top letter key of `badges` followed by an array of each badge object with the following properties:

* `id`: This is the unique ID of the badge itself. It's recommended not to put any spaces in this value, and it can only be 128 characters long.
* `name`: This is the human friendly name for the badge.
* `icon`: This is the relative path to an icon for this badge.
* `rule`: This defines the ruleset on how this particular badge is earned. There are some built in methods for earning badges, or otherwise the relative path to a JavaScript file can be used to execute logic as needed.

Below are the built in rules:

* 
