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

## API Documentation

All API endpoints must be routed over `/.netlify/functions/server`. This is a limitation from Netlify Functions that I have yet to find a workaround. As such, the root endpoint of Ebony Memo API would be:
```
https://scythian-rect-mrt-viking.netlify.app/.netlify/functions/server
```
For example, the endpoint to `GET` information about the game Rymdkapsel is `/games/rymdkapsel`, so the fetch URL should be:
```
https://scythian-rect-mrt-viking.netlify.app/.netlify/functions/server/games/rymdkapsel
```

----

### Authentication

Ebony Memo uses `JWT` *Access Token* for authorization for most `POST` requests and all `PATCH` and `DELETE` requests.

To authorize, add `Authorization` field to header with the value: `Bearer <AccessToken>`.

##### Authorization failure responses

Code `401`: No authorization token found.

Code `403`: Authorization token is invalid.

----

#### Generate a token

To generate an Access Token, send a `POST` request to endpoint `/admins/login` with the body:
`username` (String): username of the account
`password` (String): password of the account

##### Responses
Code `401`: any incorrect combination of username/password.

Code `200`: successful authentication, `adminId`, `accessToken` and `refreshToken` will also be returned.

As of the latest deployment, `accessToken` expires in **one hour**.

----

#### Refresh a token
To refresh an *Access Token*, send `POST` request to `/admins/refresh` with the body:
`refreshToken`: the previously received *Refresh Token*.

##### Responses
Code `401`: unsuccessful refresh, `refreshToken` field was empty.

Code `403`: unsuccessful refresh, `refreshToken` is invalid .

Code `200`: successful refresh, new `accessToken` is returned.

----

#### Logout
To properly logout, send `POST` request to `/admins/logout` with the body:
`refreshToken`: the previously received *Refresh Token*.

This will remove the previously provided `refreshToken` from memory and prevent it from being used again. This is highly recommended to improve security.

##### Responses
Code `400`: deletion unsuccessful, no token received.

Code `200`: deletion successful, token is removed from memory.

### Endpoints

----

`GET` `/games`
Gets a number of `Game` documents according to query parameters. Supports sorting and pagination.
##### Query parameters

`searchName` (default: `''`): The query to search by `Game.name`. This is case insensitive and will match every word.

`searchTag` (default: `''`): The query to search by `Game.tags`. This is case sensitive.

`limit` (default: `0` ): The amount of document to be returned. A `0` value will have no limit.

`page` (default: `1`): The page index of the paginated response. Index starts from `1`.

`sortBy` (default: `dateAdded`): The document field to sort the response with. `dateAdded` is automatically added upon using the `POST` `/games` endpoint. `random` is a special possible value, which will shuffle the `result` array priorly to responding.

`sortOrder` (default: `asc`): To use `asc` or `desc`. Anything that is not `desc` will be reverted to `asc`.

Empty fields are automatically reverted to default values. A `GET` request without any query parameter will result in retrieving all `Game` documents sorted by ascending `dateAdded`.
##### Responses
Code `200` (default): successful fetch.

----

`GET` `/games/:gameId`
Gets one `Game` document, which has the corresponding `gameId`.
##### Responses
Code `404`: requested `gameId` doesn't exist.

Code `200`: successful fetch.

----

`POST` `/games`
Creates a new `Game` document. Requires `Authorization`.
##### Body
`gameId` (String, required): The unique identifier for the game. Lowercase only. Generally not displayed to user. Only alphanumerics are recommended.

`name` (String, required): The formally capitalised and stylised name of the game.

`releaseYear` (Number, required): The year the game was released. Number of four digits only. Accepts only within the range of 2000-2100.

`devId` (String, required): The `devId` identifier of the developer of the game. It is recommended that the developer document is created prior to the creation of the `Game` document. Alternatively, you may use a placeholder, but do remember to update this afterwards.

`tags` (Array of Objects): The tags to provide summarised information about the game. Each tag item in the array contains the tag value for the field `name`. E.g. `{tags: [{name: "platformer}, {name: "stylish"}]}`.

`ios` (String): The URL to the iOS App Store release of the game, if available. Enter `delisted` (case sensitive) for delisted releases.

`android` (String): The URL to the Google Play Store release of the game, if available. Enter `delisted` (case sensitive) for delisted release.

`other` (Boolean): Whether an alternative release exists for the game (e.g. Humble Store, itch.io, web). Should this field be "yes", more information should be provided in the game's description.

`featured` (Boolean): Whether the game is being featured as an "Editor's Choice" title for the site. Featured games are randomly showcased on the landing page, indicated in the browse page, and can also be sorted for priority display.

`description` (String): A moderate-length description of the game by the editor in **mardown syntax**.

##### Responses
Code `409`: `gameId` already exists.

Code `201`: successful create.

----

`PATCH` `/games/:gameId`
Updates an existing `Game` document, which has the corresponding `gameId`. Requires `Authorization`.
##### Body
`gameId` (String): the new `gameId`. If the new `gameId` is the same as the old one, or already existed, code `409` will be returned. To omit if there is no attempt to modify `gameId`.

The remaining fields are optionally new data to be updated with, to refer to `POST` `/games` for data in the schema.
##### Responses
Code `404`: current `gameId` doesn't exist.

Code `409`: new `gameId` already exists.

Code `200`: successful update.

----

`DELETE` `/games/:gameId`
Deletes an existing `Game` document, which has the corresponding `gameId`. Requires `Authorization`.

##### Responses
Code `404`: requested `gameId` doesn't exist.

Code `200`: successful fetch.

----

`GET` `/devs`
Gets all documents of `Developer` schema. No body option is available for this endpoint.
##### Responses
Code `200` (default): successful fetch.

----

`GET` `/devs/:devId`
Gets one `Developer` document, which has the corresponding `devId`.
##### Responses
Code `404`: requested `devId` doesn't exist.

Code `200`: successful fetch.

----

`POST` `/devs`
Creates a new `Developer` document. Requires `Authorization`.
##### Body
`devId` (String, required): The unique identifier for the developers without space or capitalisation. When in doubt, using Twitter handle is usually a safe and good choice.

`name` (String, required): The full and formal capitalised name of the developer.

`origin` (String, required): The base country of developer in **ISO code** (e.g. US, SE, SG). Two characters only.

`twitter` (String): The Twitter handle of the developer, without full url and without the @ sign (e.g. `grapefrukt` for Grapefrukt Games).

`website` (String): The full website url of the developer.

`personnel` (Array of Strings): A list of notable and/or key members of the group (when applicable). Highly optional. Don't fret it.

##### Responses
Code `409`: `devId` already exists.

Code `201`: successful create.

----

`PATCH` `/devs/:devId`
Updates an existing `Developer` document, which has the corresponding `devId`. Requires `Authorization`.
##### Body

`devId` (String): the new `devId`. If the new `devId` is the same as the old one, or already existed, code `409` will be returned. To omit if there is no attempt to modify `devId`.

The remaining fields are optionally new data to be updated with, to refer to `POST` `/devs` for data in the `Developer` Schema.
##### Responses
Code `404`: current `devId` doesn't exist.

Code `409`: new `devId` already exists.

Code `200`: successful update.

----

`DELETE` `devs/:devId`
Deletes an existing `Developer` document, which has the corresponding `devId`. Requires `Authorization`.

##### Responses
Code `404`: requested `devId` doesn't exist.

Code `200`: successful fetch.

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

## API Documentation

All API endpoints must be routed over `/.netlify/functions/server`. This is a limitation from Netlify Functions that I have yet to find a workaround. As such, the root endpoint of Ebony Memo API would be:
```
https://scythian-rect-mrt-viking.netlify.app/.netlify/functions/server
```
For example, the endpoint to `GET` information about the game Rymdkapsel is `/games/rymdkapsel`, so the fetch URL should be:
```
https://scythian-rect-mrt-viking.netlify.app/.netlify/functions/server/games/rymdkapsel
```

----

### Authentication

Ebony Memo uses `JWT` *Access Token* for authorization for most `POST` requests and all `PATCH` and `DELETE` requests.

To authorize, add `Authorization` field to header with the value: `Bearer <AccessToken>`.

##### Authorization failure responses

Code `401`: No authorization token found.
Code `403`: Authorization token is invalid.

----

#### Generate a token

To generate an Access Token, send a `POST` request to endpoint `/admins/login` with the body:
`username` (String): username of the account
`password` (String): password of the account

##### Responses
Code `401`: any incorrect combination of username/password.
Code `200`: successful authentication, `adminId`, `accessToken` and `refreshToken` will also be returned.

As of the latest deployment, `accessToken` expires in **one hour**.

----

#### Refresh a token
To refresh an *Access Token*, send `POST` request to `/admins/refresh` with the body:
`refreshToken`: the previously received *Refresh Token*.

##### Responses
Code `401`: unsuccessful refresh, `refreshToken` field was empty.
Code `403`: unsuccessful refresh, `refreshToken` is invalid .
Code `200`: successful refresh, new `accessToken` is returned.

----

#### Logout
To properly logout, send `POST` request to `/admins/logout` with the body:
`refreshToken`: the previously received *Refresh Token*.

This will remove the previously provided `refreshToken` from memory and prevent it from being used again. This is highly recommended to improve security.

##### Responses
Code `400`: deletion unsuccessful, no token received.
Code `200`: deletion successful, token is removed from memory.

### Endpoints

----

`GET` `/games`
Gets a number of `Game` documents according to query parameters. Supports sorting and pagination.
##### Query parameters

`searchName` (default: `''`): The query query to search by `Game.name`. This is case insensitive and will match every word.

`limit` (default: `0` ): The amount of document to be returned. A `0` value will have no limit.

`page` (default: `1`): The page index of the paginated response. Index starts from `1`.

`sortBy` (default: `dateAdded`): The document field to sort the response with. `dateAdded` is automatically added upon using the `POST` `/games` endpoint. `random` is a special possible value, which will shuffle the `result` array priorly to responding.

`sortOrder` (default: `asc`): To use `asc` or `desc`. Anything that is not `desc` will be reverted to `asc`.

Empty fields are automatically reverted to default values. A `GET` request without any query parameter will result in retrieving all `Game` documents sorted by ascending `dateAdded`.
##### Responses
Code `200` (default): successful fetch.

----

`GET` `/games/:gameId`
Gets one `Game` document, which has the corresponding `gameId`.
##### Responses
Code `404`: requested `gameId` doesn't exist.
Code `200`: successful fetch.

----

`POST` `/games`
Creates a new `Game` document. Requires `Authorization`.
##### Body
`gameId` (String, required): The unique identifier for the game. Lowercase only. Generally not displayed to user. Only alphanumerics are recommended.

`name` (String, required): The formally capitalised and stylised name of the game.

`releaseYear` (Number, required): The year the game was released. Number of four digits only. Accepts only within the range of 2000-2100.

`devId` (String, required): The `devId` identifier of the developer of the game. It is recommended that the developer document is created prior to the creation of the `Game` document. Alternatively, you may use a placeholder, but do remember to update this afterwards.

`ios` (String): The URL to the iOS App Store release of the game, if available. Enter `delisted` (case sensitive) for delisted releases.

`android` (String): The URL to the Google Play Store release of the game, if available. Enter `delisted` (case sensitive) for delisted release.

`other` (Boolean): Whether an alternative release exists for the game (e.g. Humble Store, itch.io, web). Should this field be "yes", more information should be provided in the game's description.

`featured` (Boolean): Whether the game is being featured as an "Editor's Choice" title for the site. Featured games are randomly showcased on the landing page, indicated in the browse page, and can also be sorted for priority display.

`description` (String): A moderate-length description of the game by the editor in **mardown syntax**.

##### Responses
Code `409`: `gameId` already exists.
Code `201`: successful create.

----

`PATCH` `/games/:gameId`
Updates an existing `Game` document, which has the corresponding `gameId`. Requires `Authorization`.
##### Body
`gameId` (String): the new `gameId`. If the new `gameId` is the same as the old one, or already existed, code `409` will be returned. To omit if there is no attempt to modify `gameId`.

The remaining fields are optionally new data to be updated with, to refer to `POST` `/games` for data in the schema.
##### Responses
Code `404`: current `gameId` doesn't exist.
Code `409`: new `gameId` already exists.
Code `200`: successful update.

----

`DELETE` `/games/:gameId`
Deletes an existing `Game` document, which has the corresponding `gameId`. Requires `Authorization`.

##### Responses
Code `404`: requested `gameId` doesn't exist.
Code `200`: successful fetch.

----

`GET` `/devs`
Gets all documents of `Developer` schema. No body option is available for this endpoint.
##### Responses
Code `200` (default): successful fetch.

----

`GET` `/devs/:devId`
Gets one `Developer` document, which has the corresponding `devId`.
##### Responses
Code `404`: requested `devId` doesn't exist.
Code `200`: successful fetch.

----

`POST` `/devs`
Creates a new `Developer` document. Requires `Authorization`.
##### Body
`devId` (String, required): The unique identifier for the developers without space or capitalisation. When in doubt, using Twitter handle is usually a safe and good choice.

`name` (String, required): The full and formal capitalised name of the developer.

`origin` (String, required): The base country of developer in **ISO code** (e.g. US, SE, SG). Two characters only.

`twitter` (String): The Twitter handle of the developer, without full url and without the @ sign (e.g. `grapefrukt` for Grapefrukt Games).

`website` (String): The full website url of the developer.

`personnel` (Array of Strings): A list of notable and/or key members of the group (when applicable). Highly optional. Don't fret it.

##### Responses
Code `409`: `devId` already exists.
Code `201`: successful create.

----

`PATCH` `/devs/:devId`
Updates an existing `Developer` document, which has the corresponding `devId`. Requires `Authorization`.
##### Body

`devId` (String): the new `devId`. If the new `devId` is the same as the old one, or already existed, code `409` will be returned. To omit if there is no attempt to modify `devId`.

The remaining fields are optionally new data to be updated with, to refer to `POST` `/devs` for data in the `Developer` Schema.
##### Responses
Code `404`: current `devId` doesn't exist.
Code `409`: new `devId` already exists.
Code `200`: successful update.

----

`DELETE` `devs/:devId`
Deletes an existing `Developer` document, which has the corresponding `devId`. Requires `Authorization`.

##### Responses
Code `404`: requested `devId` doesn't exist.
Code `200`: successful fetch.

## Contribution

For suggestions and  criticism, please feel free to open an issue for this repository.