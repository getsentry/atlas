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

const Empty = () => <span>&mdash;</span>;

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
            <section className="profile">
              <style jsx>
                {`
                  h1 {
                    margin: 0;
                  }
                  h4 {
                    margin: 0;
                    font-weight: 500;
                  }
                  .meta,
                  .main {
                    background: #fff;
                    border-radius: 4px;
                    padding: 20px;
                    margin-bottom: 2rem;
                  }
                  .meta {
                    display: flex;
                    align-items: flex-end;
                  }
                  .meta .photo {
                    display: flex;
                    width: 128px;
                    height: 128px;
                    justify-content: center;
                    align-items: center;
                    margin-right: 20px;
                  }
                  .meta .photo img {
                    max-width: 100%;
                    max-height: 100%;
                  }
                  .meta .name {
                    flex: 1;
                    flex-direction: column;
                    align-items: center;
                  }
                  ul {
                    list-style: none;
                    padding-left: 0;
                  }
                  li {
                    margin-bottom: 5px;
                  }
                  dl {
                    padding-left: 140px;
                  }
                  dl dt {
                    float: left;
                    clear: left;
                    margin-left: -140px;
                    width: 120px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 5px;
                    color: #999;
                  }
                  dl dd {
                    margin-bottom: 5px;
                  }
                  .clearfix::after {
                    content: "";
                    clear: both;
                    display: table;
                  }
                `}
              </style>
              <section className="meta">
                <div className="photo">
                  {thisPerson.profile.photoUrl && (
                    <img src={thisPerson.profile.photoUrl} />
                  )}
                </div>
                <div className="name">
                  <h1>{thisPerson.profile.handle || thisPerson.name}</h1>
                  <h4>{thisPerson.profile.title}</h4>
                </div>
              </section>
              <section className="main">
                <dl className="clearfix">
                  <dt>Name</dt>
                  <dd>{thisPerson.name}</dd>
                  <dt>Preferred Name</dt>
                  <dd>{thisPerson.profile.handle || <Empty />}</dd>
                  <dt>Department</dt>
                  <dd>{thisPerson.profile.department || <Empty />}</dd>
                  <dt>Start Date</dt>
                  <dd>{thisPerson.profile.dateStarted || <Empty />}</dd>
                  <dt>Reports To</dt>
                  <dd>
                    {thisPerson.profile.reportsTo ? (
                      <PersonLink user={thisPerson.profile.reportsTo} />
                    ) : (
                      <Empty />
                    )}
                  </dd>
                  <dt>Office</dt>
                  <dd>
                    {thisPerson.profile.office ? (
                      thisPerson.profile.office.name
                    ) : (
                      <Empty />
                    )}
                  </dd>
                  <dt>Birthday</dt>
                  <dd>
                    {thisPerson.profile.dobMonth ? (
                      `${thisPerson.profile.dobMonth}-${
                        thisPerson.profile.dobDay
                      }`
                    ) : (
                      <Empty />
                    )}
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
            </section>
          );
        }}
      </Query>
    );
  }
}
