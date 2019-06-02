import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "./ErrorMessage";

export const PERSON_QUERY = gql`
  query getPerson($id: UUID!) {
    users(id: $id) {
      id
      name
    }
  }
`;

export default class Person extends Component {
  render() {
    return (
      <Query query={PERSON_QUERY} variables={{ id: this.props.id }}>
        {({ loading, error, data: { users } }) => {
          if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!users.length)
            return <ErrorMessage message="Couldn't find that person." />;
          const thisPerson = users[0];
          return <section>{thisPerson.name}</section>;
        }}
      </Query>
    );
  }
}
