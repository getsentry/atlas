const webpack = require("webpack");
const withSourceMaps = require("@zeit/next-source-maps");
const withCSS = require("@zeit/next-css");

module.exports = withCSS(
  withSourceMaps({
    target: "server",
    webpack: (config, { isServer, buildId }) => {
      config.plugins.push(
        new webpack.DefinePlugin({
          "process.env.SENTRY_RELEASE": JSON.stringify(buildId),
          "process.env.SENTRY_DSN": JSON.stringify(process.env.SENTRY_DSN),
          "process.env.GOOGLE_CLIENT_ID": JSON.stringify(
            process.env.GOOGLE_CLIENT_ID
          ),
          "process.env.GOOGLE_REDIRECT_URI": JSON.stringify(
            process.env.GOOGLE_REDIRECT_URI
          ),
          "process.env.GOOGLE_DOMAIN": JSON.stringify(process.env.GOOGLE_DOMAIN)
        })
      );

      if (!isServer) {
        config.resolve.alias["@sentry/node"] = "@sentry/browser";
      }

      return config;
    }
  })
);
