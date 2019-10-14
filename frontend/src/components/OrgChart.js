import React, { Component } from "react";
import styled from "@emotion/styled";

const ChildSet = styled.ul`
  margin: 0;
`;

const Node = styled.div`
  border: solid 1px hsla(0, 0%, 100%, 0.1);
  display: inline-block;
  padding: 4px;
  width: 250px;
  margin-bottom: 0.25rem;
`;

export default class OrgChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 1
    };
  }

  zoomIn = () => {
    this.setState({ zoom: this.state.zoom + 0.05 });
  };

  zoomOut = () => {
    this.setState({ zoom: this.state.zoom - 0.05 });
  };

  renderNode = node => {
    return (
      <Node>
        <this.props.NodeComponent node={node} />
      </Node>
    );
  };

  renderChildren = children => {
    if (!children.length) return null;
    return (
      <ChildSet>
        {children.map(child => {
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
