import React, { Component } from "react";
import { connect } from "react-redux";

import actions from "../redux/actions";
import Layout from "../components/Layout";

const GOOGLE_BLUE = "#4285F4";

class Login extends Component {
  render() {
    return (
      <Layout noHeader noAuth>
        <div className="login">
          <h1>Atlas</h1>
          <p>{`You'll need to sign in to continue.`}</p>
          <button onClick={this.props.login}>
            <span className="icon" />
            <span className="text">Sign in with Google</span>
          </button>
          <p>
            <small>
              Make sure to disable Adblock as it causes issues with Google Auth.
            </small>
          </p>
        </div>
        <style jsx>{`
          @font-face {
            font-family: "Roboto";
            font-weight: 500;
            src: url("/static/fonts/Roboto-Medium.ttf") format("truetype");
          }
          .login {
            max-width: 450px;
            margin: 0 auto;
            padding: 1rem;
          }
          button {
            font-family: "Roboto";
            border: 1px solid ${GOOGLE_BLUE};
            background: ${GOOGLE_BLUE};
            color: #fff;
            padding: 0;
            display: flex;
            align-items: center;
            border-radius: 2px;
            cursor: pointer;
          }
          button:active,
          button:hover {
            background: #3367d6;
          }
          button .icon {
            width: 36px;
            height: 38px;
            padding: 8px;
            background: #fff url("/static/images/google-icon.svg") no-repeat
              center center;
            background-size: 18px;
            border-right: 1px solid ${GOOGLE_BLUE};
          }
          button .text {
            height: 100%;
            padding: 8px;
            flex: 1;
          }
        `}</style>
      </Layout>
    );
  }
}

export default connect(
  null,
  actions
)(Login);
