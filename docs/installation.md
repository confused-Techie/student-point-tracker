# Installation

## Docker (Recommended)

To get started with setting up SPT on Docker, ensure to first create the expected file structure.

After choosing your root folder of where to setup your installation, create the following files and folders:

```
├── docker-compose.yml
├── storage/
│   ├── sessions/
│   ├── sql/
│   │   └── 0001-initial-migration.sql
│   └── app.yaml
```

* `docker-compose.yml` This Docker Compose file will create the actual Docker instances we will use.
* `storage/`: Will then be the top level directory of all data stored by this application.
* `sessions/`: Will be the location all active session data is saved by the server.
* `sql/`: Will be where SQL specific data is saved, such as the initial migration which creates the database.
* `app.yaml`: Will be the major configuration file of the entire program.

### Docker-Compose

The Docker-Compose file is what does all setup for this application, which includes setting up the application itself, as well as the PostgreSQL database it relies on.

While working with this file, the official [Docker Docs](https://docs.docker.com/compose/) should be referenced if needed.

The end result Docker-Compose file should look something like the below:

```yaml
version: "3.4"

services:
  db:
    image: postgres
    container_name: spt_db
    restart: always
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_USER: postgres
      POSTGRES_DB: mainDB
    volumes:
      # Ensure we make our initialization scripts accessible
      - ./storage/sql:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  backend:
    image: ghcr.io/confused-techie/student-point-tracker:latest
    container_name: spt_be
    depends_on:
      - db
    restart: always
    environment:
      DB_USER: postgres
      DB_PASS: password
      DB_DB: mainDB
      DB_HOST: 172.18.0.1
      DB_PORT: 5432
      PORT: 8080
      RESOURCE_PATH: "/usr/src/app/storage"
    ports:
      - "8153:8080"
    volumes:
      - ./storage:/usr/src/app/storage
```

> Although if any errors or issues arise, please refer to the project's [`docker-compose.yml`](../docker-compose.yml) to view the most up to date version of this file.

When setting up the above file you'll want to pay special attention to the following entries:
  * `services.db.volumes`: Here is where you need to map the Database volume to your Docker Host's volume. Without this entry the Database will never find the `0001-initial-migration.sql` migrations file, and will fail to create any valid schema for the application.
  * `services.backend.ports`: This will be the port that the application is available on, on your Docker Host.
  * `services.backend.environment.PORT`: This port must match exactly with the port specified in the Docker Container's port (`services.backend.ports`). A quick example of a proper port configuration would be: `services.backend.environment.PORT: 8080` and `services.backed.ports: - 80:8080` this would mean that the application is available on the Docker **Container** via PORT `8080`, meanwhile the Docker Container's PORT `8080` is being mapped to the Docker **Hosts** port `80`.  

### App.yaml

The `app.yaml` is a very simple YAML configuration file for the application, that allows setting any value the system accepts.

You may have noticed that any values here match some values set within the Docker-Composes `services.backend.environment`, this is by design, and either should work, but there are some [recommendations](./configuration.md).

### Migration

The Migration file (`0001-initial-migration.sql`) should be copied **exactly** from [`./migrations/0001-initial-migrations.sql`](../migrations/0001-initial-migrations.sql).

## CLI

It's also possible to run SPT via the CLI if preferred, even though this is not the recommended way.

If running via the CLI a PostgreSQL database will have to be setup and maintained on it's own, and is not covered in this documentation.

To do so, either of the options are valid:

### As an NPM Package

If the system that will run SPT already or is able to have NodeJS installed, then SPT can be installed just like any NPM Package.

To install run:

```
npm install -g confused-Techie/student-point-tracker
```

Then to setup the SPT configuration file, it's best to follow the above recommended steps for the `app.yaml` file. But when running SPT from the CLI this configuration file can be placed anywhere.

Then to run SPT:

```
spt ./PATH/to/config/app.yaml
```

Alternatively the `SPT_RESOURCE_PATH` environment variable can be set to allow just running `SPT`.

### As an Executable

If the system that will run SPT doesn't have NodeJS installed, then SPT can be run via the CLI just like any other application.

You'll need to install the SPT binary from the latest release.

Then just like every other way to run you'll want to configure the SPT configuration file.

Once this is done, you'll need to run the executable in such a way that SPT can find it's configuration file. Luckily there are plenty of choices in this case:

* Placing the executable in the same directory as the configuration file means it'll be found automatically.
* Setting the `SPT_RESOURCE_PATH` environment variable with a path to the configuration file.
* Informing SPT during every run (Detailed below).

Otherwise to run SPT:

```
.\spt.exe ./Optional/Path/to/app.yaml
```
