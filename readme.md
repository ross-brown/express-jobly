
# Jobly Backend

A RESTful API for a job application platform built with Express.js. Built to interact with data about companies, jobs, and applications, as well as authentication/authorization, while practicing a TDD approach.

Demo: https://rbrown-jobly.surge.sh/

Link to frontend repo: https://github.com/ross-brown/react-jobly
## Tech Stack
![alt text](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white&style=for-the-badge)

![alt text](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)

![alt text](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

![alt text](https://img.shields.io/badge/json%20web%20tokens-323330?style=for-the-badge&logo=json-web-tokens&logoColor=pink)


## Features

- RESTful API Architecture
- JSON Schema for server-side validation of JSON requests
- Custom Object-oriented ORM with classes to communicate with PostgreSQL database
- JSON Web Tokens for authentication
- 99.8% test coverage with Jest/Supertest


## Run Locally

Go to the project directory after cloning the repo

```bash
cd express-jobly
```

Install dependencies

```bash
npm install
```
Create and seed the database

```bash
$ psql -f jobly.sql
```

Start the server

```bash
npm start
```


## Future Features

- Add new DB table for Technologies that can be a Many-to-Many relationship with both jobs and users
- Generate a random password whenever a user is created by an admin


## Authors

- [Ross Brown](https://www.github.com/ross-brown)
- [Evan Ishibashi](https://www.github.com/evan-ishibashi)

