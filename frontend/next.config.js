const webpack = require("webpack");
const withSourceMaps = require("@zeit/next-source-maps");
const withCSS = require("@zeit/next-css");

module.exports = withCSS(
  withSourceMaps({
    target: "server",
    publicRuntimeConfig: {
      googleScopes:
        "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/admin.directory.user",
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleRedirectUri:
        process.env.GOOGLE_REDIRECT_URI || "http://localhost:8080",
      googleDomain: process.env.GOOGLE_DOMAIN || "sentry.io",
      // has to be an absolute domain due to next.js
      // https://github.com/zeit/next.js/issues/1213
      apiEndpoint: process.env.API_ENDPOINT || "http://localhost:8080/graphql/"
    },
    webpack: (config, { isServer, buildId }) => {
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env.SENTRY_RELEASE": JSON.stringify(buildId),
          "process.env.SENTRY_DSN": JSON.stringify(process.env.SENTRY_DSN),
          "process.env.SENTRY_ENVIRONMENT": JSON.stringify(
            process.env.SENTRY_ENVIRONMENT || "production"
          )
        })
      );

      if (!isServer) {
        config.resolve.alias["@sentry/node"] = "@sentry/browser";
      }

      return config;
    }
  })
);
