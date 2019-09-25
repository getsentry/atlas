# atlas

Atlas is an internal portal, offering a variety of features helping bring visibility within your organization.

It's built on top of G Suite by Google, and currently features:

- A two-way synced employee directory
- An automatically generated organization chart

This project is still in its infancy, and pull requests are absolutely welcome.

## API Keys

You'll need two sets of credentials from Google:

1. An API key with access to both the Maps JavaScript API and the Geocoding API
2. An OAuth application configured:
   - application type is internal
   - authorized domains should include your domain name (e.g. example.com)
   - scopes should include email, profile, and openid
3. A set of credentials should be generated:
   - origins and redirect uri should both be the root domain (e.g. http://atlas.example.com)

## Development

**Make sure you disable Adblock as it seems to break Google Auth**

You'll need Postgres and Redis instances running with standard credentials. A basic set of docker services are included and can be run with compose:

```shell
$ docker-compose up -d
```

From there, activate a virtualenv using Python 3.7.x (this is automatic if you're using `pyenv` and `direnv`), and install the dependencies:

```shell
$ make
```

Apply database migrations:

```shell
$ atlas migrate
```

Lastly, grab the Google, and place them in .env. See the included `.env.example` for additional configuration:

```shell
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_MAPS_KEY=
```

## Mock Data

You can load some example mock data with a basic organization structure by running the following command:

```shell
$ atlas load_mocks
```

Note: If you run this multiple times you will end up with multiple similar profiles, as they're not unique.

## Syncing People

**You will need an account with domain permission to sync data**

Once you've authenticated with your Google Auth, you can sync the directory with the following command:

```shell
$ atlas sync_google
```

## Services

Atlas is made up of two key services.

The **backend** service is a Django application exporting a graphql API. It runs on top of a Postgres database and is completely stateless.

The **frontend** service is a SPA built on React implementing the majority of user interactions as well as authentication.

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

### Offline Workers

Offline workers are bundled with the backend application, and run by Celery.

To launch the workers service (from within your virtualenv) run the following:

```shell
$ atlas worker
```

### Frontend

The frontend service is built on top of React as a Single Page Application (SPA). It contains all user interface logic as well as various business flows.

To launch the frontend service run the following:

```shell
$ cd frontend && npm start
```

## Authentication

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

Note: You can also use the included helper to generate an auth token:

```shell
$ atlas generate_auth_token [email address]
```

## Repository Layout

```
atlas
├── backend
|   ├── atlas               // django backend service
|   |   ├── models          // database schema
|   |   ├── mutations       // registered mutations
|   |   └── queries         // registered queries
└── frontend
    └── src
        ├── actions             // redux actions
        ├── components          // standard react components
        ├── pages               // core routing components
        └── reducers            // redux reducers
```

### Data Model

- Most models contain a GUID (UUID) primary key.

```
atlas
├── Office
└── User
    ├── Photo
    ├── Profile
    └── Identity
```
