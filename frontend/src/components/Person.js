import React, { Component } from "react";
import { Link } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import moment from "moment";
import styled from "@emotion/styled";
import { Email, Phone, Settings } from "@material-ui/icons";
import { Flex, Box } from "@rebass/grid/emotion";
import Markdown from "react-markdown";

import Avatar from "./Avatar";
import Birthday from "./Birthday";
import colors from "../colors";
import Card from "./Card";
import Content from "./Content";
import DaySchedule from "./DaySchedule";
import DefinitionList from "./DefinitionList";
import ErrorMessage from "./ErrorMessage";
import IconLink from "./IconLink";
import PersonList from "./PersonList";
import Pronouns from "./Pronouns";

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
    color: ${colors.white};
  }
  .meta svg {
    font-size: 1em;
    vertical-align: middle;
  }
`;

const AgeBadge = styled(({ className, user: { dateStarted, tenurePercent } }) => {
  let years = parseInt(moment().diff(moment(dateStarted), "years", true) * 100, 10) / 100;
  return (
    <Card withPadding className={className}>
      <div>
        {years} year{years !== 1 ? "s" : ""}
      </div>
      <em>joined before {parseInt((1.0 - tenurePercent) * 1000, 10) / 10}% of Sentry</em>
    </Card>
  );
})`
  font-weight: bold;
  font-size: 0.9em;
  padding: 0.5rem;
  letter-spacing: -0.1px;
  text-align: center;
  color: ${colors.black};
  background: ${colors.yellow};

  > div {
    text-transform: uppercase;
  }

  > em {
    display: block;
    margin-top: 0.5em;
    font-weight: normal;
  }
`;

const DepartmentTree = styled(({ className, department }) => {
  if (!department)
    return (
      <div className={className}>
        <Empty />
      </div>
    );
  return (
    <ul className={className}>
      {department.tree.map((n) => {
        return <li>{n.name}</li>;
      })}
      <li>{department.name}</li>
    </ul>
  );
})`
  list-style: none;
  margin: 0;
  padding: 0;
  display: inline-block;

  li {
    display: inline;

    &:after {
      padding: 0 0.25rem;
      font-size: 0.9em;
      content: " » ";
    }

    &:last-child:after {
      content: "";
    }
  }
`;

class Person extends Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
  };

  render() {
    const currentUser = this.props.user;
    return (
      <Query
        query={GET_PERSON_QUERY}
        variables={{
          email: this.props.email,
          humansOnly: false,
          includeHidden: currentUser.isSuperuser,
        }}
      >
        {({ loading, error, data }) => {
          if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!data.users.results.length)
            return <ErrorMessage message="Couldn't find that person." />;
          const thisPerson = data.users.results[0];
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
                        <h1 data-testid="name">{thisPerson.name}</h1>
                        {thisPerson.handle && thisPerson.handle !== thisPerson.name && (
                          <h2>"{thisPerson.handle}"</h2>
                        )}
                        <h4>{thisPerson.title}</h4>
                        {thisPerson.employeeType &&
                          thisPerson.employeeType.name &&
                          thisPerson.employeeType.id !== "FULL_TIME" && (
                            <h4>({thisPerson.employeeType.name})</h4>
                          )}
                      </div>
                      <div className="section">
                        <div className="item">
                          <a href={`mailto:${thisPerson.email}`} className="rrweb-hidden">
                            <Email /> {thisPerson.email}
                          </a>
                        </div>
                        <div className="item">
                          <Phone /> {thisPerson.primaryPhone || "n/a"}
                        </div>
                      </div>
                      {!!thisPerson.dateStarted && <AgeBadge user={thisPerson} />}
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

                    {thisPerson.isDirectoryHidden && (
                      <Card withPadding>
                        <strong>
                          This person has been hidden from the public directory.
                        </strong>
                      </Card>
                    )}

                    <Flex>
                      <Box width={2 / 3} px={3}>
                        <Card>
                          <DefinitionList>
                            <dt>Name</dt>
                            <dd>{thisPerson.name}</dd>
                            {thisPerson.handle && (
                              <React.Fragment>
                                <dt>Preferred Name</dt>
                                <dd>{thisPerson.handle || <Empty />}</dd>
                              </React.Fragment>
                            )}
                            <dt>Pronouns</dt>
                            <dd>
                              {thisPerson.pronouns ? (
                                <Pronouns pronouns={thisPerson.pronouns} />
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>Department</dt>
                            <dd>
                              <DepartmentTree department={thisPerson.department} />
                            </dd>
                            <dt>Team</dt>
                            <dd>
                              {thisPerson.team ? (
                                <Link
                                  to={{
                                    pathname: "/people",
                                    query: {
                                      team: thisPerson.team.name,
                                    },
                                  }}
                                >
                                  {thisPerson.team.name}
                                </Link>
                              ) : (
                                <Empty />
                              )}
                            </dd>
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
                                <Link to={`/offices/${thisPerson.office.externalId}`}>
                                  {thisPerson.office.name}
                                </Link>
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>Birthday</dt>
                            <dd>
                              <Birthday
                                dobMonth={thisPerson.dobMonth}
                                dobDay={thisPerson.dobDay}
                                emptyValue={<Empty />}
                              />
                            </dd>
                            <dt>Referred By</dt>
                            <dd>
                              {thisPerson.referredBy ? (
                                <PersonList people={[thisPerson.referredBy]} />
                              ) : (
                                <Empty />
                              )}
                            </dd>
                          </DefinitionList>
                        </Card>
                        {thisPerson.bio && (
                          <Card>
                            <h3>Bio</h3>
                            <Markdown source={thisPerson.bio} />
                          </Card>
                        )}
                        <Card>
                          <h3>Schedule</h3>
                          <DefinitionList>
                            <dt>Monday</dt>
                            <dd>
                              <DaySchedule daySchedule={thisPerson.schedule.monday} />
                            </dd>
                            <dt>Tuesday</dt>
                            <dd>
                              <DaySchedule daySchedule={thisPerson.schedule.tuesday} />
                            </dd>
                            <dt>Wednesday</dt>
                            <dd>
                              <DaySchedule daySchedule={thisPerson.schedule.wednesday} />
                            </dd>
                            <dt>Thursday</dt>
                            <dd>
                              <DaySchedule daySchedule={thisPerson.schedule.thursday} />
                            </dd>
                            <dt>Friday</dt>
                            <dd>
                              <DaySchedule daySchedule={thisPerson.schedule.friday} />
                            </dd>
                            <dt>Saturday</dt>
                            <dd>
                              <DaySchedule daySchedule={thisPerson.schedule.saturday} />
                            </dd>
                            <dt>Sunday</dt>
                            <dd>
                              <DaySchedule daySchedule={thisPerson.schedule.sunday} />
                            </dd>
                          </DefinitionList>
                        </Card>
                        <Card>
                          <h3>#social</h3>
                          <DefinitionList>
                            <dt>LinkedIn</dt>
                            <dd>
                              {thisPerson.social.linkedin ? (
                                <a
                                  href={`https://linkedin.com/in/${thisPerson.social.linkedin}/`}
                                >
                                  {thisPerson.social.linkedin}
                                </a>
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>GitHub</dt>
                            <dd>
                              {thisPerson.social.github ? (
                                <a
                                  href={`https://github.com/${thisPerson.social.github}`}
                                >
                                  {thisPerson.social.github}
                                </a>
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>Twitter</dt>
                            <dd>
                              {thisPerson.social.twitter ? (
                                <a
                                  href={`https://twitter.com/${thisPerson.social.twitter}`}
                                >
                                  {thisPerson.social.twitter}
                                </a>
                              ) : (
                                <Empty />
                              )}
                            </dd>
                          </DefinitionList>
                        </Card>
                        <Card>
                          <h3>#z-gamers</h3>
                          <DefinitionList>
                            <dt>
                              <Link
                                to={{
                                  pathname: "/people",
                                  query: {
                                    columns: "gamerTags.steam",
                                    hasAttributes: "gamerTags.steam",
                                  },
                                }}
                              >
                                Steam
                              </Link>
                            </dt>
                            <dd>
                              {thisPerson.gamerTags.steam ? (
                                <a
                                  href={`https://steamcommunity.com/id/${thisPerson.gamerTags.steam}`}
                                >
                                  {thisPerson.gamerTags.steam}
                                </a>
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>
                              <Link
                                to={{
                                  pathname: "/people",
                                  query: {
                                    columns: "gamerTags.xbox",
                                    hasAttributes: "gamerTags.xbox",
                                  },
                                }}
                              >
                                Xbox Live
                              </Link>
                            </dt>
                            <dd>
                              {thisPerson.gamerTags.xbox ? (
                                thisPerson.gamerTags.xbox
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>
                              <Link
                                to={{
                                  pathname: "/people",
                                  query: {
                                    columns: "gamerTags.playstation",
                                    hasAttributes: "gamerTags.playstation",
                                  },
                                }}
                              >
                                PlayStation
                              </Link>
                            </dt>
                            <dd>
                              {thisPerson.gamerTags.playstation ? (
                                thisPerson.gamerTags.playstation
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>
                              <Link
                                to={{
                                  pathname: "/people",
                                  query: {
                                    columns: "gamerTags.nintendo",
                                    hasAttributes: "gamerTags.nintendo",
                                  },
                                }}
                              >
                                Nintendo
                              </Link>
                            </dt>
                            <dd>
                              {thisPerson.gamerTags.nintendo ? (
                                thisPerson.gamerTags.nintendo
                              ) : (
                                <Empty />
                              )}
                            </dd>
                          </DefinitionList>
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
                            <h3>Team</h3>
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

export default connect(({ auth }) => ({
  user: auth.user,
}))(Person);
