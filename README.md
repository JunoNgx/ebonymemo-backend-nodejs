# Ebony Memo - Backend

This application is a serverless function backend, provides data access logic, to a **MongoDB database**, via a RESTful API for [Ebony Memo](https://ebonymemo.com/), an arthouse videogame curator website for smartphones. For the remaining components:
* [View the frontend source](https://github.com/JunoNgx/ebonymemo-frontend-next).
* [View the content management application source](https://github.com/JunoNgx/ebonymemo-admin-reactjs).

## Current deployment

This application is currently deployed for production [via Netlify](https://scythian-rect-mrt-viking.netlify.app/.netlify/functions/server/) with `netlify-lambda`.

[![Netlify Status](https://api.netlify.com/api/v1/badges/f2478c9d-bb43-4b22-90a3-25144cacc58c/deploy-status)](https://app.netlify.com/sites/scythian-rect-viking/deploys)

## Tech stack

This application is powered by [NodeJS](https://nodejs.org/), [Express](https://expressjs.com/), and [Mongoose](https://mongoosejs.com/). Database is hosted by **MongoDB Atlas**, and images are stored on **Google Cloud Storage**. For a full list of dependencies, please refer to `package.json`.

## Environment variables

`PORT`: default port to listen to. Does not have an impact once deployed as a serverless function.

MongoDB credential variables:
`DB_USERNAME`
`DB_PASSWORD`
`DB_DBHOST`
`DB_DBNAME`

JSON Web Token secret key, for login authentication:
`JWT_SECRETKEY`

Google Cloud Storage bucket name:
`GC_BUCKET`

Google Cloud Storage credential data:
`GC_PROJECT_ID`
`GC_PRIVATE_KEY_ID`
`GC_PRIVATE_KEY`
`GC_CLIENT_EMAIL`
`GC_CLIENT_ID`
`GC_CLIENT_X509_CERT_URL`

## Local deployment

First, clone the repository and move into the directory:
```
git clone https://github.com/JunoNgx/ebonymemo-backend-nodejs.git
cd ebonymemo-backend-nodejs
```
Then, setup the environment variables in `.env` and run the developement server:
```
npm start
```
Then open `localhost` with the corresponding port.

The project is setup with nodemon and any file change will trigger a restart.

## Contribution

For suggestions and  criticism, please feel free to open an issue for this repository.