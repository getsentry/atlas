import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { ErrorMessage } from "formik";

import Button, { ButtonLink } from "../components/Button";
import Card from "../components/Card";
import DefinitionList from "../components/DefinitionList";
import { LIST_TEAMS_QUERY } from "../queries";

export default class extends Component {
  static contextTypes = { router: PropTypes.object.isRequired };

  render() {
    return (
      <Query query={LIST_TEAMS_QUERY} variables={{ id: this.props.params.teamId }}>
        {({ loading, data: { teams } }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!teams.length)
            return <ErrorMessage message="Couldn't find that department." />;
          const team = teams[0];
          return (
            <React.Fragment>
              <Card>
                <DefinitionList>
                  <dt>ID</dt>
                  <dd>{team.id}</dd>

                  <dt>Name</dt>
                  <dd>{team.name}</dd>
                </DefinitionList>
              </Card>

              <Card withPadding>
                <ButtonLink priority="danger" to={`/admin/teams/${team.id}/delete`}>
                  Delete
                </ButtonLink>
              </Card>
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}
