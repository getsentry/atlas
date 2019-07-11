import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment";
import Avatar from "react-avatar";
import styled from "@emotion/styled";
import { Email, Phone, Settings } from "@material-ui/icons";
import { Flex, Box } from "@rebass/grid/emotion";

import colors from "../colors";
import config from "../config";
import Content from "./Content";
import ErrorMessage from "./ErrorMessage";
import IconLink from "./IconLink";
import PersonLink from "./PersonLink";
import PersonList from "./PersonList";
import Card from "./Card";

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

const ProfileHeader = styled.div`
  color: ${colors.white};
  margin-bottom: 1.5rem;
`;

class Map extends Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number
  };

  static defaultProps = {
    width: 500,
    height: 500
  };

  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  onScriptLoad = () => {
    const map = new window.google.maps.Map(this.mapRef.current, this.props.options);
    this.props.onMapLoad(map);
  };

  componentDidMount() {
    if (!window.google) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = `https://maps.google.com/maps/api/js?key=${config.googleMapsKey}`;
      var x = document.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
      // Below is important.
      //We cannot access google.maps until it's finished loading
      s.addEventListener("load", () => {
        this.onScriptLoad();
      });
    } else {
      this.onScriptLoad();
    }
  }

  render() {
    return (
      <div
        className="block"
        style={{ width: this.props.width, height: this.props.height }}
        ref={this.mapRef}
      />
    );
  }
}

class OfficeLocation extends Component {
  render() {
    return (
      <Map
        options={{
          center: { lat: 41.0082, lng: 28.9784 },
          zoom: this.props.zoom || 8,
          disableDefaultUI: this.props.withUI ? false : true
        }}
        onMapLoad={map => {
          new window.google.maps.Marker({
            position: { lat: 41.0082, lng: 28.9784 },
            map: map
          });
        }}
        {...this.props}
      />
    );
  }
}

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
                        <OfficeLocation width="100%" height={200} zoom={12} />
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
                            Edit Profile
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
                                thisPerson.profile.office.name
                              ) : (
                                <Empty />
                              )}
                            </dd>
                            <dt>Birthday</dt>
                            <dd>{dob ? dob.format("MMMM Do") : <Empty />}</dd>
                          </dl>
                        </Card>
                        <Card>
                          <OfficeLocation width="100%" height={400} zoom={8} withUI />
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
