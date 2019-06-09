import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import ErrorMessage from "./ErrorMessage";
import PersonLink from "./PersonLink";

import { PERSON_QUERY } from "../components/Person";

export const PERSON_MUTATION = gql`
  mutation updatePerson($id: UUID!) {
    updateUser(id: $id) {
      id
      name
      email
      reports {
        id
        name
        profile {
          title
          photoUrl
        }
      }
      profile {
        department
        dobMonth
        dobDay
        title
        joinedAt
        photoUrl
        office {
          name
        }
        reportsTo {
          id
          name
          profile {
            title
            photoUrl
          }
        }
      }
    }
  }
`;

export default class UpdatePerson extends Component {
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
              <style jsx>
                {`
                  h1 {
                    margin-bottom: 0;
                  }
                  h4 {
                    margin-top: 0;
                    margin-bottom: 2rem;
                    font-weight: 500;
                  }
                `}
              </style>
              <h1>{thisPerson.name}</h1>
            </section>
          );
        }}
      </Query>
    );
  }
}
