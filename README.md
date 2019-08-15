# atlas

Atlas is an internal portal, offering a variety of features helping bring visibility within your organization.

It's built on top of G Suite by Google, and currently features:

- A synced employee directory
- An automatically generated organization chart

## API Keys

You'll need two sets of credentials from Google:

1. An API key with access to both the Maps JavaScript API and the Geocoding API
2. An OAuth application configured

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
GOOGLE_MAPS_KEY=
SENTRY_DSN=
```

## Mock Data

You can load some example mock data with a basic organization structure by running the following command:

```shell
$ atlas load_mocks
```

Note: If you run this multiple times you will end up with multiple similar profiles, as they're not unique.

## Syncing People

**You will need domain permission to sync data**

Once you've authenticated with your Google Auth, you can sync the directory with the following command:

```shell
$ atlas sync_google sentry.io
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

### Backend

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

### Frontend

The frontend service is built on top of next.js. It contains all user interface logic as well as various business flows.

To launch the frontend service run the following:

```shell
$ cd frontend && npm run dev
```

## Repository Layout

```
atlas
├── backend
|   ├── atlas               // python backend service
|   |   ├── models          // database schema
|   |   ├── mutations       // registered mutations
|   |   └── queries         // registered queries
└── frontend
    └── src
        ├── components          // standard react components
        ├── pages               // next.js pages
        └── redux               // redux support
```

### Data Model

- Most models contain a GUID (UUID) primary key.

```
atlas
├── Office
└── User
    ├── Profile
    └── Identity
```
