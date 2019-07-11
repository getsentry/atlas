import React, { Component } from "react";

import config, { requiredKeys } from "../config";

import Card from "../components/Card";
import ErrorBoundary from "../components/ErrorBoundary";

function MissingConfiguration({ keys }) {
  return (
    <Card style={{ margin: "2rem auto", padding: "1rem", maxWidth: 600 }}>
      <h1>Missing Configuration</h1>
      <p>You are missing configuration for the following required parameters:</p>
      <ul>
        {keys.map(k => (
          <li key={k}>{k}</li>
        ))}
      </ul>
    </Card>
  );
}

export default class App extends Component {
  render() {
    const missingConfig = requiredKeys.filter(c => !config[c]);
    if (missingConfig.length) {
      return <MissingConfiguration keys={missingConfig} />;
    }

    return <ErrorBoundary>{this.props.children}</ErrorBoundary>;
  }
}
