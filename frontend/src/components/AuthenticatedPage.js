import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import actions from "../actions";
import PageLoader from "../components/PageLoader";

class AuthenticatedPage extends Component {
  constructor(...params) {
    super(...params);
    this.state = {
      loading: true,
    };
  }

  static contextTypes = { router: PropTypes.object.isRequired };

  static getDerivedStateFromProps(props, state) {
    return {
      loading: !props.authenticated,
    };
  }

  componentDidMount() {
    const { loadSession } = this.props;
    loadSession();
    if (this.props.authenticated === false) {
      this.context.router.push({
        pathname: "/login",
        query: { next: this.buildUrl() },
      });
    }
  }

  componentDidUpdate() {
    if (this.props.authenticated === false) {
      this.context.router.push({
        pathname: "/login",
        query: { next: this.buildUrl() },
      });
    }
  }

  buildUrl() {
    let { location } = this.context.router;
    return `${location.pathname}${location.search || ""}`;
  }

  render() {
    if (this.state.loading) {
      return <PageLoader loadingText="Please wait while we authenticate your session" />;
    }
    return this.props.children;
  }
}

export default connect(
  ({ auth }) => ({
    authenticated: auth.authenticated,
  }),
  {
    loadSession: actions.loadSession,
  }
)(AuthenticatedPage);
