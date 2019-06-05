# atlas

Atlas is an internal portal, offering a variety of features helping bring visibility within your organization.

It's built on top of G Suite by Google, and currently features:

- A synced employee directory
- An automatically generated organization chart

## Development

**Make sure you disable Adblock as it seems to break Google Auth**

You'll need a Postgres instance running with standard credentials. A basic docker service included and can be run with compose:

```shell
$ docker-compose up -d
```

From there, activate a virtualenv using Python 3.7.x (this is automatic if you're using pyenv and direnv), and install the dependencies:

```shell
$ make
```

Apply database migrations:

```shell
$ atlas migrate
```

Lastly, grab the Google and Sentry credentials, and place them in .env. See the included `.env.example`:

```shell
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
SENTRY_DSN=
```

## Mock Data

You can load an example data set of Sentry's team with the following command:

```shell
$ atlas loaddata fixtures/team.json
```

## Syncing People

**You will need domain permission to sync data**

Once you've authenticated with your Google Auth, you can sync the directory with the following command:

```shell
$ atlas sync_users_from_google sentry.io
```

## Services

Atlas is made up of two key services.

The **backend** service is a Django application exporting a graphql API. It runs on top of a Postgres database and is completely stateless.

The **frontend** service is a next.js application implementing the majority of user interactions as well as authentication.

These services can be run easily in local development using the included proxy with the following:

```shell
$ npm start
```

From there you can access the UI at http://localhost:8080. This will expose the backend at `/graphql/` and the UI at `/`.

## Backend

The backend is a GraphQL implementation powered by Graphene. The exposed endpoint is `/graphql/`.

To launch the backend service (from within your virtualenv) run the following:

```shell
$ atlas runserver
```

Authentication is done via the following:

1. Perform a login mutation:

```graphql
mutation {
  login(email: "foo@example.com", password: "bar") {
    errors
    ok
    token
    user {
      id
      email
      name
    }
  }
}
```

2. Capture the token in the response and send it with future requests:

```http
Authorization: Token {value}
```

Here's a helpful app which lets you bind an auth header:

https://github.com/skevy/graphiql-app

## Frontend

The frontend service is built on top of next.js. It contains all user interface logic as well as various business flows.

To launch the frontend service run the following:

```shell
$ cd frontend && npm run dev
```
