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
      reports {
        id
        name
        profile {
          title
          photoUrl
        }
      }
      profile {
        handle
        department
        dobMonth
        dobDay
        title
        dateStarted
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
              <h4>{thisPerson.profile.title}</h4>
              <img src={thisPerson.profile.photoUrl} />
              <dl>
                <dt>Department</dt>
                <dd>{thisPerson.profile.department || "n/a"}</dd>
                <dt>Start Date</dt>
                <dd>{thisPerson.profile.dateStarted || "n/a"}</dd>
                <dt>Reports To</dt>
                <dd>
                  {thisPerson.profile.reportsTo ? (
                    <PersonLink user={thisPerson.profile.reportsTo} />
                  ) : (
                    "n/a"
                  )}
                </dd>
                <dt>Office</dt>
                <dd>
                  {thisPerson.profile.office
                    ? thisPerson.profile.office.name
                    : "n/a"}
                </dd>
                <dt>Birthday</dt>
                <dd>
                  {thisPerson.profile.dobMonth
                    ? `${thisPerson.profile.dobMonth}-${
                        thisPerson.profile.dobDay
                      }`
                    : "n/a"}
                </dd>
              </dl>
              <h3>Reports</h3>
              <ul>
                {thisPerson.reports.map(p => (
                  <li key={p.id}>
                    <PersonLink user={p} />
                  </li>
                ))}
              </ul>
            </section>
          );
        }}
      </Query>
    );
  }
}
