# Configuration

SPT offers several methods of configuration, ranging from required, modifying existing functionality, and fully adding brand new behavior.

## Variables

The set of variables that are configurable within the system can be set in a combination of two ways:
  * The configuration File (`app.yaml`)
  * Environment Variables

Either way these variables are set they are only ever read on initial startup of the application, meaning if they've changed while the system is running, it'll need to be restarted for the changes to take effect.
The full list of values can be viewed in the example [`app.yaml`](../app.example.yaml) along with most of their default values.

Either can be used to modify the following values:

* `PORT`: This is the port the SPT will be exposed on. (If running in Docker, this is the Docker Containers Exposed Port). **Default `8080`**
* `SERVER_URL`: The URL the server will assume it is located at. Used when creating callbacks via OAuth, and when supplying pagination information. **Default `"http://localhost:8080"`**
* `DB_HOST`: This is the host of the PostgreSQL database. **No Default.**
* `DB_USER`: This is the username to login to the PostgreSQL database. **No Default.**
* `DB_PASS`: This is the password to login to the PostgreSQL database. **No Default.**
* `DB_DB`: This is the database to connect to within the PostgreSQL server. **No Default.**
* `GOOGLE_CLIENT_ID`: This is the Google App Client ID for OAuth. **No Default.**
* `GOOGLE_CLIENT_SECRET`: This is the Google App Client Secret for OAuth. **No Default.**
* `RATE_LIMIT_GENERIC`: This is the generic rate limit applied. Should be a value of requests per IP per 15 minutes window. **Default 1200.**
* `PAGINATION_LIMIT`: The value long returns are paginated by. **Default 30**
* `SITE_NAME`: A human friendly name for the website. **Default "Student Point Tracker"**
* `CSV_DELIMITER`: The delimiter used within CSV's being used for importing users. **Default ","**
* `DOMAIN`: The email domain being used eg. "example.edu". **Default "The email domain used."**
* `CACHE_TIME`: The time in milliseconds to cache information server-side. **Default 604800**
* `SESSION_FILE_STORE_TTL`: The time-to-live on the session file store. Essentially how long a user can stay logged in. **Default 3600.**
* `REQUIRE_LOGIN`: A boolean which is controls if a user **must** be signed in at all times. **Default true**
* `REPORT_A_PROBLEM_URL`: The URL to link to on the footer of every page for users to report a problem. **Default "https://github.com/confused-Techie/student-point-tracker/issues"**
* `LOCALE`: Your user base's locale. **Default "en-US"**
* `REDIRECT_STUDENTS`: If students should be redirected from the home page to their account page. **Default true**
* `FOTER_ITEM_NAME`: The custom footer element's name. **Default false**.
* `FOOTER_ITEM_LINK`: The custom footer element link. **Default false**
* `STARTUP_DB_CONNECT_RETRY_COUNT`: The amount of attempts that will be made to connect to the database during application startup. **Default 10**
* `STARTUP_DB_CONNECT_RETRY_TIME_MS`: The time in milliseconds to wait between each attempt to connect to the database during startup. **Default 1000**
* `DEV_LOGIN`: **For Development** The developer login email address.
* `DEV_IS_STUDENT`: **For Development** If the developer login should be interpreted as a student account.
* `DEV_IS_ADMIN`: **For Development** If the developer login should be interpreted as an admin account.
* `ADMINS`: An array of admin email addresses for the system.
* `POINT_CHIPS`: An array of numerical point values, to define the different values of the "Quick Points". **No Default**
* `TASKS`: An array of task objects, to define the different "Tasks". **No Default**
* `COLUMNS`: A value for how to interprete the columns in the import CSV, as defined [here](https://csv.js.org/parse/options/columns/). **Default true**

## Environment Variables

While the above variables can be optionally configured via environment variables or via the `app.yaml` configuration file, the following values are ones that can **only** be configured via environment variables.

* `STP_RESOURCE_PATH`: This is the path on the filesystem that points to the location of STP's root directory for storing information, finding configuration files etc. **Default "./storage"**
