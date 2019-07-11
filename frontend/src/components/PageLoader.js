import React, { Component } from "react";
import PropTypes from "prop-types";

import colors from "../colors";
import InternalError from "./InternalError";

export default class PageLoader extends Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    error: PropTypes.object
  };

  render() {
    let { isLoading, error } = this.props;
    if (isLoading) {
      return <div style={{ color: colors.white }}>Loading...</div>;
    } else if (error) {
      return <InternalError error={error} />;
    } else {
      return null;
    }
  }
}
