module.exports = {
  API: "/graphql/",
  GOOGLE_DOMAIN: process.env.GOOGLE_DOMAIN || "sentry.io",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_SCOPES:
    "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/admin.directory.user",
  GOOGLE_REDIRECT_URI:
    process.env.GOOGLE_REDIRECT_URI || "http://localhost:8080"
};
