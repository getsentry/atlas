import React, { Component } from "react";
import styled from "@emotion/styled";

const ChildSet = styled.ul`
  margin: 0;
  list-style: none;
  position: relative;

  ul li {
    border-left: 1px solid rgb(100, 100, 100);
    margin: 0;
    padding: 0 0 0.5rem 0.5rem;
    position: relative;

    &:first-child {
      padding-top: 0.5rem;
    }

    &:last-child {
      border-left: 0;
    }

    &:before {
      position: absolute;
      top: -1rem;
      left: 0;
      height: 2rem;
      width: 0.5rem;
      color: white;
      border-bottom: 1px solid rgb(100, 100, 100);
      content: "";
      display: inline-block;
    }

    &:last-child:before {
      border-left: 1px solid rgb(100, 100, 100);
    }
  }
`;

export default class OrgChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 1,
    };
  }

  zoomIn = () => {
    this.setState({ zoom: this.state.zoom + 0.05 });
  };

  zoomOut = () => {
    this.setState({ zoom: this.state.zoom - 0.05 });
  };

  renderNode = (node) => {
    return React.createElement(this.props.NodeComponent, { node });
  };

  renderChildren = (children) => {
    if (!children.length) return null;
    return (
      <ChildSet>
        {children.map((child) => {
          return (
            <li key={child.id}>
              {this.renderNode(child)}
              {this.renderChildren(child.children)}
            </li>
          );
        })}
      </ChildSet>
    );
  };

  render() {
    const { tree } = this.props;

    return (
      <div className={this.props.className}>
        <div className="reactOrgChart" style={{ zoom: this.state.zoom }}>
          {this.renderChildren(tree)}
        </div>
      </div>
    );
  }
}
