import React, { Component } from "react";
import { Flex, Box } from "@rebass/grid/emotion";
import PropTypes from "prop-types";

import InternalError from "./InternalError";

export default class PageLoader extends Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    error: PropTypes.object,
    loadingText: PropTypes.string,
  };

  static defaultProps = {
    isLoading: true,
  };

  render() {
    let { isLoading, error } = this.props;
    if (isLoading) {
      return (
        <Flex alignItems="center" flexDirection="column" p={5}>
          {this.props.loadingText && (
            <Box css={{ fontSize: 16, textAlign: "center" }}>
              {this.props.loadingText}
            </Box>
          )}
          <div className="sk-cube-grid">
            <div className="sk-cube sk-cube1"></div>
            <div className="sk-cube sk-cube2"></div>
            <div className="sk-cube sk-cube3"></div>
            <div className="sk-cube sk-cube4"></div>
            <div className="sk-cube sk-cube5"></div>
            <div className="sk-cube sk-cube6"></div>
            <div className="sk-cube sk-cube7"></div>
            <div className="sk-cube sk-cube8"></div>
            <div className="sk-cube sk-cube9"></div>
          </div>
        </Flex>
      );
    } else if (error) {
      return <InternalError error={error} />;
    } else {
      return null;
    }
  }
}
