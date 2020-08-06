import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";

import apolloClient from "../utils/apollo";
import Avatar from "./Avatar";
import colors from "../colors";
import FieldWrapper from "./FieldWrapper";
import { SELECT_PEOPLE_QUERY } from "../queries";

const PersonChoice = styled(({ className, user }) => {
  if (!user) return "";
  return (
    <div className={className}>
      <Avatar user={user} size={32} mr="5px" />
      <aside>
        <h4>
          {user.name} <span>&lt;{user.email}&gt;</span>
        </h4>
        <small>{user.title || ""}</small>
      </aside>
    </div>
  );
})`
  display: flex;

  span {
    font-size: 0.85em;
    color: ${colors.gray300};
  }

  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }

  aside {
    overflow: hidden;
    flex-grow: 1;
    display: inline-block;
    text-align: left;

    h4 {
      margin-bottom: 0;
      margin-top: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      span {
        font-weight: normal;
        font-size: 0.85em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    small {
      height: 1.2em;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

export default class PersonSelectField extends Component {
  static propTypes = {
    readonly: PropTypes.bool,
    name: PropTypes.string,
    label: PropTypes.string,
    exclude: PropTypes.string,
  };

  static defaultProps = {
    name: "person",
    label: "Person",
  };

  formatOptionLabel = (user) => {
    return <PersonChoice user={user} />;
  };

  getOptionValue = (user) => {
    // TODO(dcramer): id love to only use the actual primary key
    return user;
  };

  loadMatches = (inputValue, callback) => {
    apolloClient
      .query({
        query: SELECT_PEOPLE_QUERY,
        variables: {
          query: inputValue,
        },
      })
      .then(
        ({
          data: {
            users: { results },
          },
        }) => {
          callback(
            results.filter((u) => !this.props.exclude || this.props.exclude !== u.id)
          );
        }
      );
  };

  render() {
    return (
      <FieldWrapper
        type="select"
        loadOptions={this.loadMatches}
        getOptionValue={this.getOptionValue}
        formatOptionLabel={this.formatOptionLabel}
        {...this.props}
      />
    );
  }
}
