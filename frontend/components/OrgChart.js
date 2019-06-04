import React, { Component } from "react";
import Draggable from "react-draggable";

export default class OrgChart extends Component {
  static defaultProps = {
    borderColor: "#aaa"
  };

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
    const { borderColor, tree, NodeComponent } = this.props;
    const renderChildren = node => {
      const hasSiblingRight = childIndex => {
        return (node.children || []).length > childIndex + 1;
      };

      const hasSiblingLeft = childIndex => {
        return childIndex > 0;
      };

      const nodeLineBelow = (
        <td
          colSpan={(node.children || []).length * 2}
          className="nodeGroupCellLines"
        >
          <table className="nodeLineTable">
            <tbody>
              <tr>
                <td
                  colSpan={2}
                  className="nodeLineCell nodeGroupLineVerticalMiddle"
                />
                <td colSpan={2} className="nodeLineCell" />
              </tr>
            </tbody>
          </table>
        </td>
      );

      const childrenLinesAbove = (node.children || []).map(
        (child, childIndex) => (
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
        )
      );

      const children = (node.children || []).map((child, childIndex) => (
        <td colSpan="2" className="nodeGroupCell" key={childIndex}>
          {renderChildren(child)}
        </td>
      ));

      return (
        <table className="orgNodeChildGroup" key={node.id}>
          <tbody>
            <tr>
              <td
                className="nodeCell"
                colSpan={(node.children || []).length * 2}
              >
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
        <style global jsx>{`
          .reactOrgChart-container {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            top: 82px;
            margin-top: 3rem;
            border-top: 1px solid #ddd;
            display: flex;
            flex: 1;
            background-size: 10px 10px;
            background-image: linear-gradient(
                to right,
                rgba(1, 1, 1, 0.03) 1px,
                transparent 1px
              ),
              linear-gradient(
                to bottom,
                rgba(1, 1, 1, 0.03) 1px,
                transparent 1px
              );
          }
          .reactOrgChart {
            margin: 2px;
            padding: 2rem;
            display: block;
            overflow: hidden;
            cursor: all-scroll;
            flex-grow: 1;
          }

          .reactOrgChart .orgNodeChildGroup .node {
            border: solid 1px #000000;
            display: inline-block;
            padding: 4px;
            width: 100px;
          }

          .reactOrgChart .orgNodeChildGroup .nodeCell {
            text-align: center;
          }

          .reactOrgChart .orgNodeChildGroup .nodeCell .nodeItem {
            border: solid 1px ${borderColor};
            margin: 0 3px;
            border-radius: 3px;
            padding: 5px;
            width: 200px;
            display: inline-block;
            background: #fff;
          }
          .reactOrgChart .orgNodeChildGroup .nodeCell .nodeItem img {
            display: inline-block;
            width: 32px;
          }

          .reactOrgChart .orgNodeChildGroup .nodeGroupCell {
            vertical-align: top;
          }

          .reactOrgChart .orgNodeChildGroup .nodeGroupLineVerticalMiddle {
            height: 25px;
            width: 50%;
            border-right: solid 1px ${borderColor};
          }

          .reactOrgChart .nodeLineBorderTop {
            border-top: solid 1px ${borderColor};
          }

          .reactOrgChart table {
            border-collapse: collapse;
            border: none;
            margin: 0 auto;
          }

          .reactOrgChart td {
            padding: 0;
          }

          .reactOrgChart table.nodeLineTable {
            width: 100%;
          }

          .reactOrgChart table td.nodeCell {
            width: 50%;
          }
        `}</style>
      </div>
    );
  }
}
