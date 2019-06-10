import { Component } from "react";
import fetch from "isomorphic-unfetch";
import { connect } from "react-redux";

import actions from "../redux/actions";
import colors from "../colors";
import Layout from "../components/Layout";
import { login } from "../utils/auth";
const GOOGLE_BLUE = "#4285F4";

class Login extends Component {
  static getInitialProps({ req }) {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    const apiUrl = process.browser
      ? `${protocol}://${window.location.host}/login`
      : `${protocol}://${req.headers.host}/login`;

    return { apiUrl };
  }

  constructor(props) {
    super(props);

    this.state = { username: "", password: "", error: "" };
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChangeUsername(event) {
    this.setState({ username: event.target.value });
  }

  handleChangePassword(event) {
    this.setState({ password: event.target.value });
  }

  async handleSubmit(event) {
    event.preventDefault();
    this.setState({ error: "" });
    const username = this.state.username;
    const password = this.state.password;
    const url = this.props.apiUrl;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const { token } = await response.json();
        login({ token });
      } else {
        console.log("Login failed.");
        // https://github.com/developit/unfetch#caveats
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    } catch (error) {
      console.error(
        "You have an error in your code or there are Network issues.",
        error
      );
      this.setState({ error: error.message });
    }
  }

  render() {
    return (
      <Layout noHeader noAuth>
        <div className="login">
          <h1>Atlas</h1>
          <p>You'll need to sign in to continue.</p>
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
