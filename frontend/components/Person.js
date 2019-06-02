import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import ErrorMessage from "./ErrorMessage";
import PersonLink from "./PersonLink";

export const PERSON_QUERY = gql`
  query getPerson($id: UUID!) {
    users(id: $id) {
      id
      name
      email
      profile {
        dobMonth
        dobDay
        title
        joinedAt
        office {
          name
        }
        reportsTo {
          id
          name
          profile {
            title
          }
        }
      }
    }
  }
`;

export default class Person extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };

  render() {
    return (
      <Query query={PERSON_QUERY} variables={{ id: this.props.id }}>
        {({ loading, error, data }) => {
          if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!data.users.length)
            return <ErrorMessage message="Couldn't find that person." />;
          const thisPerson = data.users[0];
          return (
            <section>
              <h1>{thisPerson.name}</h1>
              <dl>
                <dt>Start Date</dt>
                <dd>{thisPerson.profile.joinedAt}</dd>
                <dt>Reports To</dt>
                <dd>
                  <PersonLink user={thisPerson.profile.reportsTo} />
                </dd>
                <dt>Office</dt>
                <dd>
                  {thisPerson.profile.office && thisPerson.profile.office.name}
                </dd>
                <dt>Birthday</dt>
                <dd>
                  {thisPerson.profile.dobMonth &&
                    `${thisPerson.profile.dobMonth}-${
                      thisPerson.profile.dobDay
                    }`}
                </dd>
              </dl>
            </section>
          );
        }}
      </Query>
    );
  }
}
