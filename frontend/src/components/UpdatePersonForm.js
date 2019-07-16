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
  // name: yup.string().required("Required"),
  // email: yup.string().required("Required"),
  handle: yup.string().nullable(),
  title: yup.string().nullable(),
  department: yup.string().nullable(),
  primaryPhone: yup.string().nullable(),
  dateStarted: yup.date().nullable(),
  dateOfBirth: yup.date().nullable(),
  isHuman: yup.bool().nullable()
});

export const PERSON_QUERY = gql`
  query getPersonForUpdate($email: String!) {
    users(email: $email, humansOnly: false) {
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
        isHuman
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
  mutation updatePerson($user: UUID!, $data: UserInput!) {
    updateUser(user: $user, data: $data) {
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
          isHuman
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
    const currentUser = this.props.user;
    const isRestricted = !currentUser.isSuperuser;
    const restrictedFields = new Set(["name", "email"]);
    if (isRestricted) {
      ["title", "department", "dateStarted", "dateOfBirth"].forEach(k =>
        restrictedFields.add(k)
      );
    }
    if (!currentUser.isSuperuser) {
      restrictedFields.add("isHuman");
    }

    return (
      <Query query={PERSON_QUERY} variables={{ email: this.props.email }}>
        {({ loading, data }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!data.users.length)
            return <ErrorMessage message="Couldn't find that person." />;
          const user = data.users[0];
          const initialValues = {
            name: user.name,
            email: user.email,
            handle: user.profile.handle || "",
            title: user.profile.title || "",
            department: user.profile.department || "",
            dateOfBirth: user.profile.dateOfBirth || "",
            dateStarted: user.profile.dateStarted || "",
            primaryPhone: user.profile.primaryPhone || "",
            isHuman: user.profile.isHuman
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
                  let data = {};
                  Object.keys(values).forEach(k => {
                    if (!restrictedFields.has(k)) {
                      data[k] = values[k] || "";
                    }
                  });
                  apolloClient
                    .mutate({
                      mutation: PERSON_MUTATION,
                      variables: {
                        user: user.id,
                        data
                      }
                    })
                    .then(
                      ({
                        data: {
                          updateUser: { ok, errors }
                        }
                      }) => {
                        setSubmitting(false);
                        if (!ok) {
                          setStatus({ error: "" + errors[0] });
                        } else {
                          this.context.router.push({
                            pathname: `/people/${user.email}`
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
                    {status && status.error && (
                      <Card withPadding>
                        <strong>{status.error}</strong>
                      </Card>
                    )}
                    <Card>
                      <h2>Basics</h2>
                      <FieldWrapper
                        type="text"
                        name="name"
                        label="Name (Given)"
                        readonly={restrictedFields.has("name")}
                      />
                      <FieldWrapper
                        type="text"
                        name="handle"
                        label="Name (Preferred)"
                        readonly={restrictedFields.has("handle")}
                      />
                      <FieldWrapper
                        type="email"
                        name="email"
                        label="Email"
                        readonly={restrictedFields.has("email")}
                      />
                      <FieldWrapper
                        type="tel"
                        name="primaryPhone"
                        label="Phone Number"
                        placeholder="+1-555-555-5555"
                        readonly={restrictedFields.has("primaryPhone")}
                      />
                      <FieldWrapper
                        type="date"
                        name="dateOfBirth"
                        label="Date of Birth"
                        readonly={restrictedFields.has("dateOfBirth")}
                      />
                    </Card>

                    <Card>
                      <h2>Role</h2>
                      <FieldWrapper
                        type="text"
                        name="title"
                        label="Title"
                        readonly={restrictedFields.has("title")}
                      />
                      <FieldWrapper
                        type="text"
                        name="department"
                        label="Department"
                        readonly={restrictedFields.has("department")}
                      />
                      <FieldWrapper
                        type="date"
                        name="dateStarted"
                        label="Start Date"
                        readonly={restrictedFields.has("dateStarted")}
                      />
                    </Card>

                    <Card>
                      <h2>Meta</h2>
                      <FieldWrapper
                        type="checkbox"
                        name="isHuman"
                        label="Human?"
                        readonly={restrictedFields.has("isHuman")}
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
