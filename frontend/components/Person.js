import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment";
import Avatar from "react-avatar";

import config from "../config";
import ErrorMessage from "./ErrorMessage";
import PersonLink from "./PersonLink";
import PersonList from "./PersonList";

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

class Map extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  onScriptLoad = () => {
    const map = new window.google.maps.Map(
      this.mapRef.current,
      this.props.options
    );
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
    return <div style={{ width: 500, height: 500 }} ref={this.mapRef} />;
  }
}

class OfficeLocation extends Component {
  render() {
    return (
      <Map
        id="myMap"
        options={{
          center: { lat: 41.0082, lng: 28.9784 },
          zoom: 8
        }}
        onMapLoad={map => {
          new window.google.maps.Marker({
            position: { lat: 41.0082, lng: 28.9784 },
            map: map,
            title: "Hello Istanbul!"
          });
        }}
      />
    );
  }
}

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
                  .main {
                    display: flex;
                  }
                  .about,
                  .map {
                    width: 50%;
                  }
                `}
              </style>
              <section className="meta">
                <div className="photo">
                  {thisPerson.profile.photoUrl ? (
                    <img src={thisPerson.profile.photoUrl} />
                  ) : (
                    <Avatar name={thisPerson.name} size="128" />
                  )}
                </div>
                <div className="name">
                  <h1>{thisPerson.profile.handle || thisPerson.name}</h1>
                  <h4>{thisPerson.profile.title}</h4>
                </div>
              </section>
              <section className="main">
                <div className="about">
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
                  <h3>Reports</h3>
                  <PersonList people={thisPerson.reports} />
                </div>
                <div className="map">
                  <OfficeLocation />
                </div>
              </section>
            </section>
          );
        }}
      </Query>
    );
  }
}
