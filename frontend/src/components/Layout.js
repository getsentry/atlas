import React, { Component } from "react";
import PropTypes from "prop-types";

import AuthenticatedPage from "./AuthenticatedPage";
import Header from "./Header";

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
      <div className="container">
        {!this.props.noHeader && <Header />}
        <main>{this.props.children}</main>
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        {!this.props.noAuth ? (
          <AuthenticatedPage>{this.renderBody()}</AuthenticatedPage>
        ) : (
          this.renderBody()
        )}
      </React.Fragment>
    );
  }
}
