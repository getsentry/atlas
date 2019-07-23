import React, { Component } from "react";
import PropTypes from "prop-types";
import { Global, css } from "@emotion/core";
import styled from "@emotion/styled";

import AuthenticatedPage from "./AuthenticatedPage";
import colors from "../colors";
import Header from "./Header";

const globalStyles = css`
  @font-face {
    font-family: "Rubik";
    font-weight: 400;
    src: url("./fonts/Rubik-Regular.ttf") format("truetype");
  }
  /* @font-face {
  font-family: "Rubik";
  src: url("./fonts/Rubik-Italic.ttf") format("truetype");
  font-weight: 400;
  font-style: italic;
} */
  @font-face {
    font-family: "Rubik";
    font-weight: 500;
    src: url("./fonts/Rubik-Medium.ttf") format("truetype");
  }
  @font-face {
    font-family: "Rubik";
    font-weight: 700;
    src: url("./fonts/Rubik-Bold.ttf") format("truetype");
  }
  @font-face {
    font-family: "Roboto";
    font-weight: 500;
    src: url("./fonts/Roboto-Medium.ttf") format("truetype");
  }
  html {
    box-sizing: border-box;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }
  body {
    background: ${colors.background};
    margin: 0;
    color: ${colors.text};
    font-family: "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
    font-size: 0.95rem;
  }
  button,
  input,
  select,
  textarea {
    font-family: "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
    font-size: 0.95rem;
  }
  p {
    line-height: 1.8;
  }
  dl,
  p,
  table,
  form,
  ul,
  ol,
  .block {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  small {
    font-size: 85%;
  }
  pre,
  code {
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace;
  }
  pre {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
  a {
    color: ${colors.linkText};
    text-decoration: none;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  h1 {
    font-size: 2em;
  }
  h2 {
    font-size: 1.5em;
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

  label {
    font-weight: 400;
    display: inline-block;
    margin-bottom: 5px;
  }
  button,
  input,
  optgroup,
  select,
  textarea {
    margin: 0;
  }
  button,
  input {
    overflow: visible;
  }
  input[type="text"],
  input[type="tel"],
  input[type="email"],
  input[type="number"],
  input[type="date"],
  select,
  textarea {
    width: 100%;
    padding: 0.375rem 0.75rem;
    line-height: 1.5;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
    background: #fff;
    color: #495057;
  }
  input:disabled,
  select:disabled,
  textarea:disabled {
    background: #ced4da;
  }
  button {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    padding: 0.375rem 0.75rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    cursor: pointer;
    background: #fff;
    color: #495057;
    transition: color 0.1s ease-in-out, background-color 0.1s ease-in-out,
      border-color 0.15s ease-in-out, box-shadow 0.1s ease-in-out;
  }
  button:hover {
    background: #6c5fc7;
    border-color: #6c5fc7;
    color: #fff;
  }
  .clearfix::after {
    content: "";
    clear: both;
    display: table;
  }
  .MuiSvgIcon-root {
    vertical-align: middle;
  }
  table {
    width: 100%;
    margin: -0.5rem -0.5rem 0.5rem;
  }
  td,
  th {
    text-align: center;
    padding: 0.5rem;
  }
  td:first-child,
  th:first-child {
    text-align: left;
  }
  tr:nth-child(odd) td {
    background: rgba(31, 45, 61, 0.15);
  }
  tr td:first-child a {
    font-weight: bold;
  }
`;

const Footer = styled(({ className }) => (
  <div className={className}>
    <a href="https://github.com/getsentry/atlas">Atlas is Open Source</a> — Made with ♥ by{" "}
    <a href="https://sentry.io">Sentry</a>
  </div>
))`
  font-size: 0.8em;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  padding: 2rem 1rem;
  a {
    color: inherit;
    text-decoration: underline;
  }
`;

export default class Layout extends Component {
  static propTypes = {
    title: PropTypes.string,
    noHeader: PropTypes.bool,
    noAuth: PropTypes.bool
  };

  static defaultProps = {
    noHeader: false,
    noAuth: false
  };

  renderBody() {
    return (
      <React.Fragment>
        {!this.props.noHeader && <Header />}
        {this.props.children}
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        <Global styles={globalStyles} />
        {!this.props.noAuth ? (
          <AuthenticatedPage>{this.renderBody()}</AuthenticatedPage>
        ) : (
          this.renderBody()
        )}
        <Footer />
      </React.Fragment>
    );
  }
}
