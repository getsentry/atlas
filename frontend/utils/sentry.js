// NOTE: This require will be replaced with `@sentry/browser` when
// process.browser === true thanks to the webpack config in next.config.js
const Sentry = require("@sentry/node");
const SentryIntegrations = require("@sentry/integrations");
const Cookie = require("js-cookie");

module.exports = (
  release = process.env.SENTRY_RELEASE,
  environment = process.env.SENTRY_ENVIRONMENT
) => {
  const processEvent = (event, hints) => {
    const err = hints.originalException;
    if (err) {
      if (err.message) {
        // De-duplication currently doesn't work correctly for SSR / browser errors
        // so we force deduplication by error message if it is present
        event.fingerprint = [err.message];
      }

      if (err.statusCode) {
        event.extra.statusCode = err.statusCode;
      }

      const sessionId = Cookie.get("sid");
      if (sessionId) {
        event.user.id = { id: sessionId };
      }

      if (err.ctx) {
        const { errorInfo } = err.ctx;
        err.tags.ssr = !process.browser;

        if (errorInfo) {
          event.contexts.errorInfo = {};
          Object.keys(errorInfo).forEach(
            key => (event.contexts.errorInfo = errorInfo[key])
          );
        }
      }
    }
  };

  const sentryOptions = {
    dsn: process.env.SENTRY_DSN,
    environment,
    release,
    attachStacktrace: true,
    beforeSend: processEvent
  };

  // When we're developing locally
  if (process.env.NODE_ENV !== "production") {
    /* eslint-disable-next-line global-require */
    const sentryTestkit = require("sentry-testkit");
    const { sentryTransport } = sentryTestkit();

    // Don't actually send the errors to Sentry
    sentryOptions.transport = sentryTransport;

    // Instead, dump the errors to the console
    sentryOptions.integrations = [
      new SentryIntegrations.Debug({
        // Trigger DevTools debugger instead of using console.log
        debugger: false
      })
    ];
  }

  Sentry.init(sentryOptions);
  return Sentry;
};
