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
  lng: -122.0842499,
};

const OfficeSchema = yup.object().shape({
  name: yup.string().required("Required"),
  location: yup.string().nullable(),
});

export const OFFICE_QUERY = gql`
  query getOfficeForUpdate($externalId: String!) {
    offices(externalId: $externalId) {
      id
      externalId
      name
      description
      location
      postalCode
      regionCode
      lat
      lng
    }
  }
`;

export const OFFICE_MUTATION = gql`
  mutation updateOffice($office: UUID!, $data: OfficeInput!) {
    updateOffice(office: $office, data: $data) {
      ok
      errors
      office {
        id
        externalId
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
    externalId: PropTypes.string.isRequired,
  };

  static contextTypes = { router: PropTypes.object.isRequired };

  onChange = (currentFormikState, nextFormikState) => {
    if (currentFormikState.location !== nextFormikState.location) {
      this.queryLocation(nextFormikState.location);
    }
  };

  queryLocation = (location) => {
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
          hasAdjustedLatLng: true,
        });
      }
    });
  };

  createMarker = (map, position) => {
    const marker = new window.google.maps.Marker({
      map: map,
      position: position,
      draggable: true,
    });
    marker.addListener("dragend", (value) => {
      this.setState({
        lat: value.latLng.lat(),
        lng: value.latLng.lng(),
        hasAdjustedLatLng: true,
      });
    });
    return marker;
  };

  render() {
    return (
      <Query query={OFFICE_QUERY} variables={{ externalId: this.props.externalId }}>
        {({ loading, data }) => {
          //if (error) return <ErrorMessage message="Error loading office." />;
          if (loading) return <div>Loading</div>;
          if (!data.offices.length)
            return <ErrorMessage message="Couldn't find that office." />;
          const office = data.offices[0];
          const initialValues = {
            name: office.name,
            externalId: office.externalId,
            location: office.location,
            description: office.description,
            postalCode: office.postalCode,
            regionCode: office.regionCode,
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
                  const data = {
                    ...values,
                  };
                  if (this.state.hasAdjustedLatLng) {
                    data.lat = this.state.lat;
                    data.lng = this.state.lng;
                  }
                  apolloClient
                    .mutate({
                      mutation: OFFICE_MUTATION,
                      variables: {
                        office: office.id,
                        data,
                      },
                    })
                    .then(
                      ({
                        data: {
                          updateOffice: { ok, errors },
                        },
                      }) => {
                        setSubmitting(false);
                        if (!ok) {
                          setStatus({ error: "" + errors[0] });
                        } else {
                          this.context.router.push({
                            pathname: `/offices/${office.externalId}`,
                          });
                        }
                      },
                      (err) => {
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
                      <FieldWrapper
                        type="text"
                        name="externalId"
                        label="External ID"
                        readonly
                      />
                      <FieldWrapper type="text" name="name" label="Name" readonly />
                      <FieldWrapper
                        type="textarea"
                        name="description"
                        label="Description"
                        readonly
                      />
                    </Card>

                    <Card>
                      <h2>Location</h2>
                      <FieldWrapper
                        type="textarea"
                        name="location"
                        label="Location"
                        placeholder="e.g. 1500 Cool Ln, San Francisco CA"
                        onChange={this.updateLocation}
                        readonly
                      />
                      <FieldWrapper
                        type="text"
                        name="postalCode"
                        label="Postal Code"
                        onChange={this.updateLocation}
                        readonly
                      />
                      <FieldWrapper
                        type="text"
                        name="regionCode"
                        label="Region Code"
                        onChange={this.updateLocation}
                        readonly
                      />
                      <Map
                        options={{
                          center: officeCoords,
                          zoom: 15,
                        }}
                        onMapLoad={(map) => {
                          this.setState(
                            {
                              map,
                              marker: hasLocation && this.createMarker(map, officeCoords),
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
