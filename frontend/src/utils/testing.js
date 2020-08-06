import React, { Component } from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { ApolloProvider } from "react-apollo";
import { render as defaultRender } from "@testing-library/react";

import apolloClient from "./apollo";
import { initStore } from "../store";

export function render(ui, { initialState, store = initStore(initialState) } = {}) {
  return {
    ...defaultRender(
      <ApolloProvider client={apolloClient}>
        <Provider store={store}>{ui}</Provider>
      </ApolloProvider>
    ),
    // adding `store` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    store,
  };
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
    ...params,
  };
}

export const mocks = {
  User: (...params) => ({
    id: "a-uuid",
    handle: "Jane",
    email: "jane@example.com",
    name: "Jane Doe",
    isSuperuser: false,
    hasOnboarded: true,
    photo: null,
    reportsTo: null,
    office: null,
    department: null,
    team: null,
    bio: null,
    dobMonth: null,
    dobDay: null,
    title: null,
    dateStarted: null,
    primaryPhone: null,
    isHuman: true,
    isDirectoryHidden: false,
    employeeType: null,
    tenurePercent: 1,
    pronouns: null,
    schedule: {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    },
    social: {
      linkedin: null,
      twitter: null,
      github: null,
    },
    gamerTags: {
      playstation: null,
      xbox: null,
      steam: null,
      nintendo: null,
    },
    reports: [],
    peers: [],
    referredBy: null,
    ...params,
  }),
};

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
        pathname: PropTypes.string,
      }),
    }),
  };

  static defaultProps = {
    router: mockRouter(),
  };

  getChildContext() {
    return {
      router: this.props.router,
    };
  }

  render() {
    return this.props.children;
  }
}

export function tick() {
  return new Promise((resolve) => setTimeout(resolve));
}
