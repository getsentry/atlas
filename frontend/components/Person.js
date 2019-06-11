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
              <h1>{thisPerson.profile.handle || thisPerson.name}</h1>
              <h4>{thisPerson.profile.title}</h4>
              {thisPerson.profile.photoUrl && (
                <img src={thisPerson.profile.photoUrl} />
              )}
              <dl>
                <dt>Name</dt>
                <dd>{thisPerson.name}</dd>
                <dt>Preferred Name</dt>
                <dd>{thisPerson.profile.handle || ""}</dd>
                <dt>Department</dt>
                <dd>{thisPerson.profile.department || ""}</dd>
                <dt>Start Date</dt>
                <dd>{thisPerson.profile.dateStarted || ""}</dd>
                <dt>Reports To</dt>
                <dd>
                  {thisPerson.profile.reportsTo ? (
                    <PersonLink user={thisPerson.profile.reportsTo} />
                  ) : (
                    ""
                  )}
                </dd>
                <dt>Office</dt>
                <dd>
                  {thisPerson.profile.office
                    ? thisPerson.profile.office.name
                    : ""}
                </dd>
                <dt>Birthday</dt>
                <dd>
                  {thisPerson.profile.dobMonth
                    ? `${thisPerson.profile.dobMonth}-${
                        thisPerson.profile.dobDay
                      }`
                    : ""}
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
