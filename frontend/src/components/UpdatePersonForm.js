import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";

import Button from "../components/Button";
import Card from "../components/Card";
import FieldWrapper from "../components/FieldWrapper";
import apolloClient from "../utils/apollo";

const UserSchema = yup.object().shape({
  name: yup.string().required("Required"),
  email: yup.string().required("Required"),
  handle: yup.string().nullable(),
  title: yup.string().nullable(),
  department: yup.string().nullable(),
  primaryPhone: yup.string().nullable(),
  dateStarted: yup.date().nullable(),
  dateOfBirth: yup.date().nullable()
});

export const PERSON_QUERY = gql`
  query getPersonForUpdate($email: String!) {
    users(email: $email) {
      id
      name
      email
      profile {
        handle
        department
        title
        dateOfBirth
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

export const PERSON_MUTATION = gql`
  mutation updatePerson(
    $user: UUID!
    $handle: String
    $title: String
    $department: String
    $primaryPhone: PhoneNumber
    $dateOfBirth: Date
    $dateStarted: Date
  ) {
    updateUser(
      user: $user
      handle: $handle
      title: $title
      department: $department
      primaryPhone: $primaryPhone
      dateOfBirth: $dateOfBirth
      dateStarted: $dateStarted
    ) {
      ok
      errors
      user {
        id
        name
        email
        profile {
          handle
          department
          title
          dateOfBirth
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
  }
`;

class UpdatePersonForm extends Component {
  static propTypes = {
    email: PropTypes.string.isRequired
  };

  static contextTypes = { router: PropTypes.object.isRequired };

  render() {
    let currentUser = this.props.user;
    return (
      <Query query={PERSON_QUERY} variables={{ email: this.props.email }}>
        {({ loading, data }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!data.users.length)
            return <ErrorMessage message="Couldn't find that person." />;
          const user = data.users[0];
          const isRestricted = !currentUser.isSuperuser;
          const initialValues = {
            name: user.name,
            email: user.email,
            handle: user.profile.handle,
            title: user.profile.title,
            department: user.profile.department,
            dateOfBirth: user.profile.dateOfBirth,
            dateStarted: user.profile.dateStarted,
            primaryPhone: user.profile.primaryPhone
          };
          return (
            <section>
              <Card>
                <h1>{user.name}</h1>
              </Card>
              <Formik
                initialValues={initialValues}
                validationSchema={UserSchema}
                onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
                  apolloClient
                    .mutate({
                      mutation: PERSON_MUTATION,
                      variables: {
                        user: user.id,
                        ...values
                      }
                    })
                    .then(
                      (...params) => {
                        setSubmitting(false);
                        this.context.router.push({
                          pathname: `/people/${user.email}`
                        });
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
                    {status && status.error && (
                      <Card>
                        <strong>{status.error}</strong>
                      </Card>
                    )}
                    <Card>
                      <h2>Basics</h2>
                      <FieldWrapper
                        type="text"
                        name="name"
                        label="Name (Given)"
                        readonly
                      />
                      <FieldWrapper type="text" name="handle" label="Name (Preferred)" />
                      <FieldWrapper type="email" name="email" label="Email" readonly />
                      <FieldWrapper
                        type="tel"
                        name="primaryPhone"
                        label="Phone Number"
                        placeholder="+1-555-555-5555"
                      />
                      <FieldWrapper
                        type="date"
                        name="dateOfBirth"
                        label="Date of Birth"
                        readonly={isRestricted}
                      />
                    </Card>

                    <Card>
                      <h2>Role</h2>
                      <FieldWrapper
                        type="text"
                        name="title"
                        label="Title"
                        readonly={isRestricted}
                      />
                      <FieldWrapper
                        type="text"
                        name="department"
                        label="Department"
                        readonly={isRestricted}
                      />
                      <FieldWrapper
                        type="date"
                        name="dateStarted"
                        label="Start Date"
                        readonly={isRestricted}
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

export default connect(({ auth }) => ({
  user: auth.user
}))(UpdatePersonForm);
