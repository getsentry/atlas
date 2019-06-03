import React, { Component } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { connect } from "react-redux";

import actions from "../redux/actions";
import ErrorMessage from "./ErrorMessage";
import Header from "./Header";
import colors from "../colors";

class Layout extends Component {
  static propTypes = {
    title: PropTypes.string,
    noHeader: PropTypes.bool,
    noAuth: PropTypes.bool
  };

  static defaultProps = {
    noHeader: false,
    noAuth: false
  };

  render() {
    return (
      <React.Fragment>
        <Head>
          <title>{this.props.title && `${this.props.title} | `}Atlas</title>
        </Head>
        <style jsx global>{`
          @font-face {
            font-family: "Rubik";
            font-weight: 400;
            src: url("/static/fonts/Rubik-Regular.ttf") format("truetype");
          }
          @font-face {
            font-family: "Rubik";
            src: asset-url("/static/fonts/Rubik-Italic.ttf") format("truetype");
            font-weight: 400;
            font-style: italic;
          }
          @font-face {
            font-family: "Rubik";
            font-weight: 500;
            src: url("/static/fonts/Rubik-Medium.ttf") format("truetype");
          }
          @font-face {
            font-family: "Rubik";
            font-weight: 700;
            src: url("/static/fonts/Rubik-Bold.ttf") format("truetype");
          }
          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            color: #333;
            font-family: "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji",
              "Segoe UI Emoji", "Segoe UI Symbol";
            font-size: 0.95rem;
          }
          p {
            line-height: 1.8;
          }
          small {
            font-size: 85%;
          }
          pre,
          code {
            font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo,
              Courier, monospace;
          }
          a {
            color: ${colors.primary};
            text-decoration: none;
          }
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 2em;
            margin-bottom: 0;
            margin-top: 0;
          }
          h2 {
            font-size: 1.5em;
            margin-top: 3rem;
          }
          h3 {
            font-size: 1.125em;
          }
          h4 {
            font-size: 1.075em;
          }
          h5,
          h6 {
            font-size: 1em;
          }
          .container {
            max-width: 65rem;
            margin: 1.5rem auto;
            padding-left: 1rem;
            padding-right: 1rem;
          }
        `}</style>
        {this.renderBody()}
      </React.Fragment>
    );
  }

  renderBody() {
    if (this.props.authLoading) {
      return <div>Loading...</div>;
    }
    if (!this.props.noAuth && this.props.isAuthenticated === false) {
      return (
        <div className="container">
          <ErrorMessage message="Not authenticated" />
        </div>
      );
    }
    return (
      <div className="container">
        {!this.props.noHeader && <Header />}
        <main>{this.props.children}</main>
      </div>
    );
  }
}

const mapStateToProps = ({ auth }) => ({
  isAuthenticated: auth.authenticated,
  authLoading: auth.authenticated === null
});

export default connect(
  mapStateToProps,
  actions
)(Layout);
