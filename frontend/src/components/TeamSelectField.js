import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";

import apolloClient from "../utils/apollo";
import FieldWrapper from "./FieldWrapper";

export const LIST_TEAMS_QUERY = gql`
  query listTeams($query: String) {
    teams(query: $query, limit: 10) {
      name
    }
  }
`;

export default class TeamSelectField extends Component {
  static propTypes = {
    readonly: PropTypes.bool,
    name: PropTypes.string,
    label: PropTypes.string,
    exclude: PropTypes.string
  };

  static defaultProps = {
    name: "team",
    label: "Team"
  };

  loadMatches = (inputValue, callback) => {
    apolloClient
      .query({
        query: LIST_TEAMS_QUERY,
        variables: {
          query: inputValue
        }
      })
      .then(({ data: { teams } }) => {
        callback(
          teams
            .filter(u => !this.props.exclude || this.props.exclude !== u.id)
            .map(team => ({
              label: team.name,
              value: team.name
            }))
        );
      });
  };

  render() {
    return (
      <FieldWrapper
        type="select"
        creatable
        loadOptions={this.loadMatches}
        getOptionValue={this.getOptionValue}
        {...this.props}
      />
    );
  }
}
