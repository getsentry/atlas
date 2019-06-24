const webpack = require("webpack");

module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.ATLAS_CONFIG": JSON.stringify({
        googleScopes:
          "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/admin.directory.user",
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:8080",
        googleDomain: process.env.GOOGLE_DOMAIN || "sentry.io",
        googleMapsKey: process.env.GOOGLE_MAPS_KEY || "",
        // has to be an absolute domain due to next.js
        // https://github.com/zeit/next.js/issues/1213
        apiEndpoint: process.env.API_ENDPOINT || "http://localhost:8080/graphql/",
        environment: process.env.NODE_ENV || "development",
        sentryDsn: process.env.SENTRY_DSN,
        version: process.env.BUILD_REVISION || ""
      })
    })
  );

  return config;
};
