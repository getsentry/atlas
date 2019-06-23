import React, { Component } from "react";
import Draggable from "react-draggable";

import "./OrgChart.css";

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

  render() {
    const { tree, NodeComponent } = this.props;
    const renderChildren = node => {
      const hasSiblingRight = childIndex => {
        return (node.children || []).length > childIndex + 1;
      };

      const hasSiblingLeft = childIndex => {
        return childIndex > 0;
      };

      const nodeLineBelow = (
        <td colSpan={(node.children || []).length * 2} className="nodeGroupCellLines">
          <table className="nodeLineTable">
            <tbody>
              <tr>
                <td colSpan={2} className="nodeLineCell nodeGroupLineVerticalMiddle" />
                <td colSpan={2} className="nodeLineCell" />
              </tr>
            </tbody>
          </table>
        </td>
      );

      const childrenLinesAbove = (node.children || []).map((child, childIndex) => (
        <td colSpan="2" className="nodeGroupCellLines" key={childIndex}>
          <table className="nodeLineTable">
            <tbody>
              <tr>
                <td
                  colSpan={2}
                  className={
                    "nodeLineCell nodeGroupLineVerticalMiddle" +
                    (hasSiblingLeft(childIndex) ? " nodeLineBorderTop" : "")
                  }
                />
                <td
                  colSpan={2}
                  className={
                    "nodeLineCell" +
                    (hasSiblingRight(childIndex) ? " nodeLineBorderTop" : "")
                  }
                />
              </tr>
            </tbody>
          </table>
        </td>
      ));

      const children = (node.children || []).map((child, childIndex) => (
        <td colSpan="2" className="nodeGroupCell" key={childIndex}>
          {renderChildren(child)}
        </td>
      ));

      return (
        <table className="orgNodeChildGroup" key={node.id}>
          <tbody>
            <tr>
              <td className="nodeCell" colSpan={(node.children || []).length * 2}>
                <NodeComponent node={node} />
              </td>
            </tr>
            <tr>{(node.children || []).length > 0 && nodeLineBelow}</tr>
            <tr>{childrenLinesAbove}</tr>
            <tr>{children}</tr>
          </tbody>
        </table>
      );
    };

    return (
      <div className="reactOrgChart-container">
        <div className="reactOrgChart" style={{ zoom: this.state.zoom }}>
          <Draggable>
            <div>{tree.map(renderChildren)}</div>
          </Draggable>
        </div>
      </div>
    );
  }
}
