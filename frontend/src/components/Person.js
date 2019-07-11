import React, { Component } from "react";
import { Link } from "react-router";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment";
import Avatar from "react-avatar";
import styled from "@emotion/styled";
import { Email, Phone, Settings } from "@material-ui/icons";
import { Flex, Box } from "@rebass/grid/emotion";

import colors from "../colors";
import Content from "./Content";
import ErrorMessage from "./ErrorMessage";
import IconLink from "./IconLink";
import PersonLink from "./PersonLink";
import PersonList from "./PersonList";
import Card from "./Card";
import OfficeMap from "./OfficeMap";

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
      peers {
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
        primaryPhone
        office {
          id
          name
          location
          lat
          lng
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

const ProfileHeader = styled.div`
  color: ${colors.white};
  margin-bottom: 1.5rem;
`;

const PersonContainer = styled.article`
  h1 {
    margin: 0;
  }
  h4 {
    margin: 0;
    font-weight: 500;
  }
  .meta {
    color: ${colors.white};
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .meta .name,
  .meta .contact,
  .meta .photo,
  .meta .map {
    text-align: center;
    margin-bottom: 1rem;
  }
  .meta .contact > div {
    margin-bottom: 0.5rem;
  }
  .meta .map {
    width: 100%;
    margin-top: 1rem;
  }
  .meta .photo {
    width: 128px;
    height: 128px;
    display: block;
    border-radius: 128px;
  }
  .meta .photo img,
  .meta .photo .sb-avatar,
  .meta .photo .sb-avatar > div {
    max-width: 100%;
    max-height: 100%;
    border-radius: 128px;
  }
  .meta h1 {
    font-size: 1.4em;
    margin-bottom: 0;
  }
  .meta h2 {
    font-size: 1.3em;
    margin-bottom: 0;
  }
  .meta h4 {
    font-weight: normal;
    font-size: 1em;
  }
  .meta a {
    color: #fff;
  }
  .meta svg {
    font-size: 1em;
    vertical-align: middle;
  }
  dl {
    margin: 0 0 1.5rem;
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
          const dob = thisPerson.profile.dobMonth
            ? moment(
                `${new Date().getFullYear()}-${thisPerson.profile.dobMonth}-${
                  thisPerson.profile.dobDay
                }`,
                "YYYY-MM-DD"
              )
            : null;
          return (
            <PersonContainer>
              <Content>
                <Flex style={{ height: "100%" }}>
                  <Box width={300} px={3}>
                    <section className="meta">
                      <div className="photo">
                        {thisPerson.profile.photoUrl ? (
                          <img src={thisPerson.profile.photoUrl} />
                        ) : (
                          <Avatar name={thisPerson.name} size="128" />
                        )}
                      </div>
                      <div className="name">
                        <h1>{thisPerson.name}</h1>
                        {thisPerson.profile.handle &&
                          thisPerson.profile.handle != thisPerson.name && (
                            <h2>"{thisPerson.profile.handle}"</h2>
                          )}
                        <h4>{thisPerson.profile.title}</h4>
                      </div>
                      <div className="contact">
                        <div>
                          <a href={`mailto:${thisPerson.email}`}>
                            <Email /> {thisPerson.email}
                          </a>
                        </div>
                        <div>
                          <Phone /> {thisPerson.profile.primaryPhone || "n/a"}
                        </div>
                      </div>
                      <div className="map">
                        <OfficeMap
                          width="100%"
                          height={200}
                          zoom={12}
                          office={thisPerson.profile.office}
                        />
                      </div>
                    </section>
                  </Box>
                  <Box flex="1">
                    <ProfileHeader>
                      <Flex alignItems="center">
                        <Box px={3} flex="1">
                          <h1>Profile</h1>
                        </Box>
                        <Box px={3}>
                          <IconLink
                            icon={<Settings />}
                            to={`/people/${this.props.id}/update`}
                            style={{ fontSize: "0.9em" }}
                          >
                            Edit
                          </IconLink>
                        </Box>
                      </Flex>
                    </ProfileHeader>

                    <Flex>
                      <Box width={2 / 3} px={3}>
                        <Card>
                          <dl className="clearfix">
                            <dt>Name</dt>
                            <dd>{thisPerson.name}</dd>
                            <dt>Preferred Name</dt>
                            <dd>{thisPerson.profile.handle || <Empty />}</dd>
                            <dt>Department</dt>
                            <dd>{thisPerson.profile.department || <Empty />}</dd>
                            <dt>Start Date</dt>
                            <dd>
                              {thisPerson.profile.dateStarted ? (
                                moment(thisPerson.profile.dateStarted).format(
                                  "MMMM Do YYYY"
                                )
                              ) : (
                                <Empty />
                              )}
                            </dd>
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
                                <Link to={`/offices/${thisPerson.profile.office.id}`}>
                                  {thisPerson.profile.office.name}
                                </Link>
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>Birthday</dt>
                            <dd>{dob ? dob.format("MMMM Do") : <Empty />}</dd>
                          </dl>
                        </Card>
                      </Box>
                      <Box width={1 / 3} px={3}>
                        {!!thisPerson.reports.length && (
                          <Card>
                            <h3>Reports</h3>
                            <PersonList people={thisPerson.reports} />
                          </Card>
                        )}
                        {!!thisPerson.peers.length && (
                          <Card>
                            <h3>Peers</h3>
                            <PersonList people={thisPerson.peers} />
                          </Card>
                        )}
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              </Content>
            </PersonContainer>
          );
        }}
      </Query>
    );
  }
}
