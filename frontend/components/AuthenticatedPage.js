import React, { Component } from "react";
import { connect } from "react-redux";
import Router from "next/router";

import config from "../config";
import actions from "../redux/actions";
import loadScript from "../utils/loadScript";
import { getCookie } from "../utils/cookie";
import RootLoader from "../components/RootLoader";

class AuthenticatedPage extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      loading: true
    };
  }

  static getDerivedStateFromProps(props, state) {
    return {
      loading: state.loading && props.authenticated === null
    };
  }

  componentDidMount() {
    const { loadGoogleAPI, logout, reauth } = this.props;

    loadScript(
      document,
      "script",
      "google-login",
      "https://apis.google.com/js/api.js",
      () => {
        const gapi = window.gapi;
        gapi.load("auth2", () => {
          loadGoogleAPI(gapi);

          const params = {
            hosted_domain: config.googleDomain,
            client_id: config.googleClientId,
            cookie_policy: "single_host_origin",
            fetch_basic_profile: true,
            ux_mode: "popup",
            redirect_uri: config.googleRedirectUri,
            scope: config.googleScopes,
            access_type: "offline"
          };
          if (!gapi.auth2.getAuthInstance()) {
            gapi.auth2
              .init(params)
              .then(res => {
                const curToken = getCookie("token");
                if (curToken && res.isSignedIn && res.isSignedIn.get()) {
                  reauth(curToken);
                } else {
                  logout();
                  Router.push("/login");
                }
              })
              .catch(err => {
                actions.logout();
                Router.push("/login");
                throw err;
              });
          } else {
            throw new Error("How did i get here");
          }
        });
      }
    );
  }

  render() {
    if (this.state.loading) {
      return <RootLoader />;
    }
    return this.props.children;
  }
}

export default connect(
  ({ auth }) => ({
    authenticated: auth.authenticated
  }),
  {
    loadGoogleAPI: actions.loadGoogleAPI,
    logout: actions.logout,
    reauth: actions.reauth
  }
)(AuthenticatedPage);
