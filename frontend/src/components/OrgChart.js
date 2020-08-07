import React, { Component } from "react";
import styled from "@emotion/styled";
import { Box, Flex } from "@rebass/grid/emotion";
import IconLink from "./IconLink";
import { FindReplace, ZoomIn, ZoomOut } from "@material-ui/icons";
import Card from "./Card";
import PeopleViewSelectors from "./PeopleViewSelectors";

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

const ZOOM_FACTOR = 0.05;

export default class OrgChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 1
    };
  }

  zoomIn = () => {
    this.setState({ zoom: this.state.zoom + ZOOM_FACTOR });
  };

  zoomOut = () => {
    this.setState({ zoom: this.state.zoom - ZOOM_FACTOR });
  };

  resetZoom = () => {
    this.setState({ zoom: 1 });
  };

  renderNode = node => {
    return React.createElement(this.props.NodeComponent, { node });
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
        <Card>
          <Flex mx={-3} alignItems="left">
            <Box width={250} mx={3}>
              <h1>Org Chart</h1>
            </Box>
            <Box mr={3}>
              <IconLink
                icon={<ZoomIn />}
                onClick={() => this.zoomIn()}
                style={{ fontSize: "1.3em", marginBottom: "1rem" }}
              />
            </Box>
            <Box mr={3}>
              <IconLink
                icon={<FindReplace />}
                onClick={() => {
                  this.resetZoom();
                }}
                style={{ fontSize: "1.3em", marginBottom: "1rem" }}
              />
            </Box>
            <Box mr={3}>
              <IconLink
                icon={<ZoomOut />}
                onClick={this.zoomOut}
                style={{ fontSize: "1.3em", marginBottom: "1rem" }}
              />
            </Box>
            <PeopleViewSelectors current={"orgChart"} />
          </Flex>
        </Card>
        <div className="reactOrgChart" style={{ zoom: this.state.zoom }}>
          {this.renderChildren(tree)}
        </div>
      </div>
    );
  }
}
