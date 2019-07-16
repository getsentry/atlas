import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";

import Button from "../components/Button";
import Card from "../components/Card";
import FieldWrapper from "../components/FieldWrapper";
import FormikEffect from "../components/FormikEffect";
import Map from "../components/Map";
import apolloClient from "../utils/apollo";

const DEFAULT_COORDS = {
  lat: 37.4224764,
  lng: -122.0842499
};

const OfficeSchema = yup.object().shape({
  name: yup.string().required("Required"),
  location: yup.string().nullable()
});

export const OFFICE_QUERY = gql`
  query getOfficeForUpdate($id: UUID!) {
    offices(id: $id) {
      id
      name
      location
      lat
      lng
    }
  }
`;

export const OFFICE_MUTATION = gql`
  mutation updateOffice($office: UUID!, $location: String, $lat: Decimal, $lng: Decimal) {
    updateOffice(office: $office, location: $location, lat: $lat, lng: $lng) {
      ok
      errors
      office {
        id
        name
        location
        lat
        lng
      }
    }
  }
`;

export default class UpdateOfficeForm extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };

  static contextTypes = { router: PropTypes.object.isRequired };

  onChange = (currentFormikState, nextFormikState) => {
    if (currentFormikState.location !== nextFormikState.location) {
      this.queryLocation(nextFormikState.location);
    }
  };

  queryLocation = location => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK") {
        const position = results[0].geometry.location;
        this.state.map.setCenter(position);
        let { marker } = this.state;
        if (!marker) {
          marker = this.createMarker(this.state.map, position);
        } else {
          marker.setPosition(position);
        }
        this.setState({
          marker,
          lat: position.lat(),
          lng: position.lng(),
          hasAdjustedLatLng: true
        });
      }
    });
  };

  createMarker = (map, position) => {
    const marker = new window.google.maps.Marker({
      map: map,
      position: position,
      draggable: true
    });
    marker.addListener("dragend", value => {
      this.setState({
        lat: value.latLng.lat(),
        lng: value.latLng.lng(),
        hasAdjustedLatLng: true
      });
    });
    return marker;
  };

  render() {
    return (
      <Query query={OFFICE_QUERY} variables={{ id: this.props.id }}>
        {({ loading, data }) => {
          //if (error) return <ErrorMessage message="Error loading office." />;
          if (loading) return <div>Loading</div>;
          if (!data.offices.length)
            return <ErrorMessage message="Couldn't find that office." />;
          const office = data.offices[0];
          const initialValues = {
            name: office.name,
            location: office.location
          };
          let hasLocation = office.lat && office.lng;
          let officeCoords = hasLocation
            ? { lat: +office.lat, lng: +office.lng }
            : DEFAULT_COORDS;

          return (
            <section>
              <Card>
                <h1>{office.name}</h1>
              </Card>
              <Formik
                initialValues={initialValues}
                validationSchema={OfficeSchema}
                onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
                  const payload = {
                    office: this.props.id,
                    ...values
                  };
                  if (this.state.hasAdjustedLatLng) {
                    payload.lat = this.state.lat;
                    payload.lng = this.state.lng;
                  }
                  apolloClient
                    .mutate({
                      mutation: OFFICE_MUTATION,
                      variables: payload
                    })
                    .then(
                      ({
                        data: {
                          updateOffice: { ok, errors }
                        }
                      }) => {
                        setSubmitting(false);
                        if (!ok) {
                          setStatus({ error: "" + errors[0] });
                        } else {
                          this.context.router.push({
                            pathname: `/offices/${office.id}`
                          });
                        }
                      },
                      err => {
                        if (err.graphQLErrors && err.graphQLErrors.length) {
                          // do something useful
                          setStatus({ error: "" + err });
                        } else {
                          setStatus({ error: "" + err });
                        }
                        setSubmitting(false);
                      }
                    );
                }}
              >
                {({ isSubmitting, status }) => (
                  <Form>
                    <FormikEffect onChange={this.onChange} />
                    {status && status.error && (
                      <Card withPadding>
                        <strong>{status.error}</strong>
                      </Card>
                    )}
                    <Card>
                      <h2>Basics</h2>
                      <FieldWrapper type="text" name="name" label="Name" readonly />
                    </Card>

                    <Card>
                      <h2>Location</h2>
                      <FieldWrapper
                        type="text"
                        name="location"
                        label="Location"
                        placeholder="e.g. 1500 Cool Ln, San Francisco CA, 94107, USA"
                        onChange={this.updateLocation}
                      />
                      <Map
                        options={{
                          center: officeCoords,
                          zoom: 15
                        }}
                        onMapLoad={map => {
                          this.setState(
                            {
                              map,
                              marker: hasLocation && this.createMarker(map, officeCoords)
                            },
                            () => {
                              !hasLocation &&
                                office.location &&
                                this.queryLocation(office.location);
                            }
                          );
                        }}
                        width="100%"
                        height={400}
                      />
                    </Card>

                    <Card withPadding>
                      <Button type="submit" disabled={isSubmitting}>
                        Submit
                      </Button>
                    </Card>
                  </Form>
                )}
              </Formik>
            </section>
          );
        }}
      </Query>
    );
  }
}
