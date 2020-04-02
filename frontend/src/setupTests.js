export function mockApolloClient() {
  // Similar to MockedProvider, except Apollo doesn't provide a native
  // client mock out of the box.
  //
  // This exposes an addMock function on the apolloClient, which takes the same
  // input as a mock entry in a MockedProvider allows.
  jest.mock("./utils/apollo", () => {
    const { ApolloClient, InMemoryCache } = jest.requireActual("apollo-boost");
    const { MockLink } = jest.requireActual("@apollo/react-testing");

    const link = new MockLink([], false);

    const client = new ApolloClient({
      cache: new InMemoryCache({ addTypename: false }),
      link
    });

    client.addMockedResponse = mock => link.addMockedResponse(mock);

    return client;
  });
}

export function mockLoadScript() {
  jest.mock("./utils/loadScript", () => () =>
    new Promise((resolve, reject) => resolve())
  );
}

export function mockGoogleAuth() {
  let authInstance = null;
  window.gapi = {
    load: (name, callback) => {
      if (name === "auth2") {
        window.gapi.auth2 = {
          init: params =>
            new Promise((resolve, reject) => {
              authInstance = {
                grantOfflineAccess: params =>
                  new Promise((resolve, reject) => {
                    resolve({
                      code: "abcdef"
                    });
                  })
              };

              resolve({
                isSignedIn: {
                  get: () => true
                }
              });
            }),
          getAuthInstance: () => authInstance
        };
        callback();
      } else {
        throw new Error("Invalid library");
      }
    }
  };
}

export function mockReactRouter() {
  jest.mock("react-router", () => {
    const ReactRouter = require.requireActual("react-router");
    return {
      IndexRedirect: ReactRouter.IndexRedirect,
      IndexRoute: ReactRouter.IndexRoute,
      Link: ReactRouter.Link,
      Redirect: ReactRouter.Redirect,
      Route: ReactRouter.Route,
      withRouter: ReactRouter.withRouter,
      browserHistory: {
        goBack: jest.fn(),
        push: jest.fn(),
        replace: jest.fn(),
        listen: jest.fn(() => {})
      }
    };
  });
}

export function mockSentry() {
  jest.mock("@sentry/browser", () => {
    const SentryBrowser = require.requireActual("@sentry/browser");
    return {
      init: jest.fn(),
      configureScope: jest.fn(),
      setUser: jest.fn(),
      setTag: jest.fn(),
      setTags: jest.fn(),
      setExtra: jest.fn(),
      setExtras: jest.fn(),
      captureBreadcrumb: jest.fn(),
      addBreadcrumb: jest.fn(),
      captureMessage: jest.fn(),
      captureException: jest.fn(),
      showReportDialog: jest.fn(),
      startSpan: jest.fn(),
      finishSpan: jest.fn(),
      lastEventId: jest.fn(),
      getCurrentHub: jest.spyOn(SentryBrowser, "getCurrentHub"),
      withScope: jest.spyOn(SentryBrowser, "withScope"),
      Severity: SentryBrowser.Severity
    };
  });
}

mockApolloClient();
mockLoadScript();
mockGoogleAuth();
mockReactRouter();
mockSentry();
