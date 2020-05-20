import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";

import Button from "../components/Button";
import Card from "../components/Card";
import FieldWrapper from "../components/FieldWrapper";
import apolloClient from "../utils/apollo";
import { LIST_TEAMS_QUERY } from "../queries";

const TeamSchema = yup.object().shape({
  name: yup.string().nullable()
});

export const TEAM_DELETE_MUTATION = gql`
  mutation deleteTeam($team: UUID!, $newteam: UUID) {
    deleteTeam(team: $team, newTeam: $newteam) {
      ok
      errors
    }
  }
`;

export default class extends Component {
  static contextTypes = { router: PropTypes.object.isRequired };

  loadMatchingTeams = (inputValue, callback) => {
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
            .filter(d => d.id !== this.props.params.teamId)
            .map(u => ({
              value: u.id,
              label: u.name
            }))
        );
      });
  };

  render() {
    return (
      <Query query={LIST_TEAMS_QUERY} variables={{ id: this.props.params.teamId }}>
        {({ loading, data: { teams } }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!teams.length) return <ErrorMessage message="Couldn't find that team." />;
          const team = teams[0];
          return (
            <Formik
              initialValues={{}}
              validationSchema={TeamSchema}
              onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
                const data = { team: team.id };
                if (values.newTeam) {
                  data.newTeam = values.newTeam.value;
                }
                apolloClient
                  .mutate({
                    mutation: TEAM_DELETE_MUTATION,
                    variables: data
                  })
                  .then(
                    ({ data: { deleteTeam }, errors }) => {
                      setSubmitting(false);
                      if (errors) {
                        setStatus({ error: "" + errors[0].message });
                      } else if (!deleteTeam.ok) {
                        setStatus({ error: "" + deleteTeam.errors[0] });
                      } else {
                        this.context.router.push({
                          pathname: `/admin/teams`
                        });
                      }
                    },
                    err => {
                      if (err.graphQLErrors && err.graphQLErrors.length) {
                        // do something useful
                        setStatus({ error: "" + err });
                      } else {
                        setStatus({ error: "" + err });
                      }
                      setSubmitting(false);
                    }
                  );
              }}
            >
              {({ isSubmitting, status, errors }) => (
                <Form>
                  <Card>
                    <p>
                      You are removing the <strong>{team.name}</strong> team.
                    </p>
                    <p>
                      To continue you need to select an optional team where any existing
                      people will be transferred to.
                    </p>
                    <p>
                      <strong>This operation cannot be undone!</strong>
                    </p>
                  </Card>
                  {status && status.error && (
                    <Card withPadding>
                      <strong>{status.error}</strong>
                    </Card>
                  )}
                  <Card>
                    <FieldWrapper
                      type="select"
                      name="newTeam"
                      a
                      label="New Team"
                      help="Where should we transfer people to?"
                      loadOptions={this.loadMatchingTeams}
                    />
                  </Card>

                  <Card withPadding>
                    <Button priority="danger" type="submit" disabled={isSubmitting}>
                      Save & Delete
                    </Button>
                  </Card>
                </Form>
              )}
            </Formik>
          );
        }}
      </Query>
    );
  }
}
