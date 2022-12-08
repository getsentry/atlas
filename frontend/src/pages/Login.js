import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import styled from "@emotion/styled";

import actions from "../actions";
import Layout from "../components/Layout";
import Card from "../components/Card";
import PageLoader from "../components/PageLoader";

import GoogleIcon from "../images/google-icon.svg";

const GOOGLE_BLUE = "#4285F4";

const LoginContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
`;

const Button = styled.button`
  border: 1px solid ${GOOGLE_BLUE};
  background: ${GOOGLE_BLUE};
  color: #fff;
  padding: 0;
  display: flex;
  align-items: center;
  border-radius: 2px;
  cursor: pointer;
  font-weight: bold;
  &:active,
  &:hover {
    background: #3367d6;
  }
  .icon {
    width: 36px;
    height: 38px;
    padding: 8px;
    background: #fff url(${GoogleIcon}) no-repeat center center;
    background-size: 18px;
    border-right: 1px solid ${GOOGLE_BLUE};
  }
  .text {
    height: 100%;
    padding: 8px;
    flex: 1;
  }
`;

class Login extends Component {
  constructor(...params) {
    super(...params);
    this.state = {
      loading: true,
    };
  }

  static contextTypes = {
    router: PropTypes.object,
  };

  static getDerivedStateFromProps(props, state) {
    return {
      loading: state.loading && props.gapi === null,
    };
  }

  componentDidMount() {
    this.props.loadSession();
  }

  componentDidUpdate() {
    if (this.props.authenticated) {
      let nextUri = this.props.user.hasOnboarded
        ? this.context.router.location.query.next || "/"
        : "/onboarding";
      if (nextUri.indexOf("/") !== 0) nextUri = "";
      this.context.router.push({
        pathname: nextUri,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <Layout noHeader noAuth>
          <PageLoader />
        </Layout>
      );
    }
    return (
      <Layout noHeader noAuth>
        <LoginContainer>
          <Card>
            <h1>Atlas</h1>
            <p>{`You'll need to sign in to continue.`}</p>
            <div className="block">
              <Button onClick={this.props.login}>
                <span className="icon" />
                <span className="text">Sign in with Google</span>
              </Button>
            </div>
            <p>
              <small>
                Make sure to disable Adblock as it causes issues with Google Auth.
              </small>
            </p>
          </Card>
        </LoginContainer>
      </Layout>
    );
  }
}

export default connect(
  ({ auth }) => ({
    gapi: auth.gapi,
    authenticated: auth.authenticated,
    user: auth.user,
  }),
  { loadSession: actions.loadSession, login: actions.login }
)(Login);
