import React, { Component } from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { render as defaultRender } from "@testing-library/react";

import { initStore } from "../store";

export function render(ui, { initialState, store = initStore(initialState) } = {}) {
  return {
    ...defaultRender(<Provider store={store}>{ui}</Provider>),
    // adding `store` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    store
  };
}

export function mockApolloClient() {
  // Similar to MockedProvider, except Apollo doesn't provide a native
  // client mock out of the box.
  //
  // This exposes an addMock function on the apolloClient, which takes the same
  // input as a mock entry in a MockedProvider allows.
  jest.mock("./apollo", () => {
    function compareMaps(map1, map2) {
      return !Object.keys(map1).find(k => map1[k] !== map2[k]);
    }

    let mocks = [];
    const getResult = (query, variables) => {
      return new Promise((resolve, reject) => {
        let match = mocks.find(
          ({ request }) =>
            request.query === query &&
            compareMaps(request.variables || {}, variables || {})
        );
        if (!match) reject(new Error("Unable to find mock request"));
        else if (match.error) reject(match.error);
        else resolve(match.result);
      });
    };

    return {
      mutate: ({ mutation, variables }) => getResult(mutation, variables),
      query: ({ query, variables }) => getResult(query, variables),
      addMock: mock => mocks.push(mock)
    };
  });
}

export function mockLoadScript() {
  jest.mock("./loadScript", () => () => new Promise((resolve, reject) => resolve()));
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

export function mockRouter(...params) {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    listen: jest.fn(),
    setRouteLeaveHook: jest.fn(),
    isActive: jest.fn(),
    createHref: jest.fn(),
    location: { query: {} },
    ...params
  };
}

export class RouterContext extends Component {
  static childContextTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
      go: PropTypes.func.isRequired,
      goBack: PropTypes.func.isRequired,
      goForward: PropTypes.func.isRequired,
      listen: PropTypes.func.isRequired,
      setRouteLeaveHook: PropTypes.func.isRequired,
      isActive: PropTypes.func.isRequired,
      createHref: PropTypes.func.isRequired,
      location: PropTypes.shape({
        query: PropTypes.object,
        pathname: PropTypes.string
      })
    })
  };

  static defaultProps = {
    router: mockRouter()
  };

  getChildContext() {
    return {
      router: this.props.router
    };
  }

  render() {
    return this.props.children;
  }
}

export function tick() {
  return new Promise(resolve => setTimeout(resolve));
}
