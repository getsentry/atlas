import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

import apolloClient from "../utils/apollo";
import colors from "../colors";
import FieldWrapper from "./FieldWrapper";
import { SELECT_DEPARTMENT_QUERY } from "../queries";

const DepartmentTree = styled(({ className, name, tree }) => {
  return (
    <div className={className}>
      <span>{name}</span>
      {tree && !!tree.length && (
        <ul>
          {tree.map(n => {
            return <li>{n.name}</li>;
          })}
        </ul>
      )}
    </div>
  );
})`
  ul {
    list-style: none;
    font-size: 0.85em;
    margin: 0;
    padding: 0;
    display: inline;
    color: ${colors.gray300};

    &:before {
      content: "(";
      margin-left: 1rem;
    }

    &:after {
      content: ")";
    }

    li {
      display: inline;

      &:after {
        padding: 0 0.25rem;
        font-size: 0.9em;
        content: " » ";
      }

      &:last-child:after {
        display: none;
      }
    }
  }
`;

export default class DepartmentSelectField extends Component {
  static propTypes = {
    readonly: PropTypes.bool,
    name: PropTypes.string,
    label: PropTypes.string,
    exclude: PropTypes.string
  };

  static defaultProps = {
    name: "department",
    label: "Department"
  };

  formatOption = ({ value, label, tree }) => {
    return <DepartmentTree name={label} tree={tree} />;
  };

  loadMatches = (inputValue, callback) => {
    apolloClient
      .query({
        query: SELECT_DEPARTMENT_QUERY,
        variables: {
          query: inputValue
        }
      })
      .then(({ data: { departments } }) => {
        callback(
          departments
            .filter(u => !this.props.exclude || this.props.exclude !== u.id)
            .map(u => ({
              value: u.id,
              label: u.name,
              tree: u.tree
            }))
        );
      });
  };

  render() {
    return (
      <FieldWrapper
        type="select"
        loadOptions={this.loadMatches}
        formatOptionLabel={this.formatOption}
        {...this.props}
      />
    );
  }
}
