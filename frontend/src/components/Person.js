import React, { Component } from "react";
import { Link } from "react-router";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import moment from "moment";
import styled from "@emotion/styled";
import { Email, Phone, Settings } from "@material-ui/icons";
import { Flex, Box } from "@rebass/grid/emotion";

import Avatar from "./Avatar";
import colors from "../colors";
import Content from "./Content";
import ErrorMessage from "./ErrorMessage";
import IconLink from "./IconLink";
import PersonList from "./PersonList";
import Card from "./Card";
import { GET_PERSON_QUERY } from "../queries";

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
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .meta .name,
  .meta .contact,
  .meta .photo,
  .meta .section {
    text-align: center;
    margin-bottom: 1rem;
  }
  .meta h1,
  .meta h2,
  .meta h4,
  .meta .item {
    color: ${colors.white};
    margin-bottom: 0.25rem;
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
    margin: 0 0 1rem;
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

const AgeBadge = styled(({ className, dateStarted }) => {
  return (
    <Card withPadding className={className}>
      {parseInt(moment().diff(moment(dateStarted), "years", true) * 100, 10) / 100} years
    </Card>
  );
})`
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: -0.1px;
  color: ${colors.black};
  background: ${colors.yellow};
`;

export default class Person extends Component {
  static propTypes = {
    email: PropTypes.string.isRequired
  };

  render() {
    return (
      <Query
        query={GET_PERSON_QUERY}
        variables={{ email: this.props.email, humansOnly: false }}
      >
        {({ loading, error, data }) => {
          if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!data.users.length)
            return <ErrorMessage message="Couldn't find that person." />;
          const thisPerson = data.users[0];
          const dob = thisPerson.dobMonth
            ? moment(
                `${new Date().getFullYear()}-${thisPerson.dobMonth}-${thisPerson.dobDay}`,
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
                        <Avatar user={thisPerson} size={196} />
                      </div>
                      <div className="section">
                        <h1>{thisPerson.name}</h1>
                        {thisPerson.handle && thisPerson.handle !== thisPerson.name && (
                          <h2>"{thisPerson.handle}"</h2>
                        )}
                        <h4>{thisPerson.title}</h4>
                      </div>
                      <div className="section">
                        <div className="item">
                          <a href={`mailto:${thisPerson.email}`}>
                            <Email /> {thisPerson.email}
                          </a>
                        </div>
                        <div className="item">
                          <Phone /> {thisPerson.primaryPhone || "n/a"}
                        </div>
                      </div>
                      {!!thisPerson.dateStarted && (
                        <AgeBadge dateStarted={thisPerson.dateStarted} />
                      )}
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
                            to={`/people/${this.props.email}/update`}
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
                            <dd>{thisPerson.handle || <Empty />}</dd>
                            <dt>Department</dt>
                            <dd>{thisPerson.department || <Empty />}</dd>
                            <dt>Start Date</dt>
                            <dd>
                              {thisPerson.dateStarted ? (
                                moment(thisPerson.dateStarted).format("MMMM Do YYYY")
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>Office</dt>
                            <dd>
                              {thisPerson.office ? (
                                <Link to={`/offices/${thisPerson.office.id}`}>
                                  {thisPerson.office.name}
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
                        {thisPerson.reportsTo && (
                          <Card>
                            <h3>Manager</h3>
                            <PersonList people={[thisPerson.reportsTo]} />
                          </Card>
                        )}
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
