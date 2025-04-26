## About The Project

[TechScrum](https://techscrumapp.com)

For more info please refer to

- https://lilac-dancer-737.notion.site/Backend-8d15124cec444344bbd41935ed697b1e

#### Master

[![CircleCI](https://dl.circleci.com/status-badge/img/bb/010001/be.techscrum/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/bb/010001/be.techscrum/tree/master)

#### Develop

[![CircleCI](https://dl.circleci.com/status-badge/img/bb/010001/be.techscrum/tree/develop.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/bb/010001/be.techscrum/tree/develop)

### Tech Stack

- Express (Back end web application framework)
- Agenda (Job scheduling)
- Winston (Logging framework)
- Nodemon (Automatically restarts application when code files are updated)
- Loggly (Cloud-based logging solutions)

## TechDebt

See the [open issues](https://010001.atlassian.net/jira/software/projects/TEC/boards/2/backlog) for a full list of proposed features (and known issues).

### Prerequisites

n/a

### Installation

One time command

- docker compose up
- cp .env.example .env `(values ask Kitman/team members)`
- yarn build
- yarn setup
- yarn setup-vscode-plugin
- start application (Section below)
- Go to chrome paste this http://localhost:8000/api/v2/healthcheck

### Start application

yarn run dev

### Database access

The access database via

- http://localhost:8081/
- Username: admin
- Password: pass

### Folder structure (Devs)

- config: Contains configuration files that store settings and parameters used to customize the behavior of an application.
- controllers: Manages the flow of data between the front end (view) and the back end (services).
- database: Should not be touching this
- emailTemplate: email templates for AWS
- middleware: filter or intermediary in the request-response cycle.
- model: holds the data models of an application, defining the structure, relationships
- routes: Define the various endpoints and paths of a web application, mapping them to the appropriate controller functions for handling requests.
- services: Contains the business logic and data manipulation code.
- types: Typescript types
- utils: helper functions that provide common, reusable functionalities used across different parts of an application.
- validation: process of ensuring that input data meets predefined criteria and is correct, complete, and secure before it's processed or used in an application.
- loader: Stuff that starts the application

## Tests

- npm run test

## Logs

Logs file help developers/devops to address server or code issues when application crashes, you would need to ask email and password from Kitman.

- Local: /storage/logs/logger.log. This file will only generate when there are errors
- Production: https://techscrumapp.loggly.com/search?terms=tag:heroku&from=-20m&until=now&source_group=&newtab=1#terms=tag:*&from=2023-08-12T06:55:41.477Z&until=2023-08-12T07:15:41.477Z&source_group=

## License

## Coding Standard

- https://lilac-dancer-737.notion.site/Coding-Guidelines-bfa77d75476a4b19a195ddb20b02bb33
