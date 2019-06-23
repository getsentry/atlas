import React, { Component } from "react";
import PropTypes from "prop-types";

export default class Modal extends Component {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.string.isRequired,
    subtext: PropTypes.string,
    maxWidth: PropTypes.number
  };

  static defaultProps = {
    maxWidth: 600
  };

  render() {
    return (
      <div
        style={{
          margin: "auto",
          maxWidth: this.props.maxWidth
        }}
      >
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/">Logo</a>
        </div>
        <div
          style={{
            border: "10px solid #111",
            margin: 20,
            borderRadius: "4px",
            background: "#fff",
            padding: 20
          }}
        >
          {this.props.subtext ? (
            <h1 style={{ opacity: 0.2, float: "right" }}>{this.props.subtext}</h1>
          ) : null}
          <h1>{this.props.title}</h1>
          {this.props.children}
        </div>
      </div>
    );
  }
}
