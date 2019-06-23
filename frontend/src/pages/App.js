import React, { Component } from "react";
import ErrorBoundary from "../components/ErrorBoundary";

export default class App extends Component {
  render() {
    return <ErrorBoundary>{this.props.children}</ErrorBoundary>;
  }
}
