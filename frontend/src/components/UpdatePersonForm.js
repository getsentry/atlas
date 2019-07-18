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
import { PRONOUNS } from "../components/Pronouns";
import apolloClient from "../utils/apollo";

const UserSchema = yup.object().shape({
  // name: yup.string().required("Required"),
  // email: yup.string().required("Required"),
  handle: yup.string().nullable(),
  pronouns: yup.string(),
  title: yup.string().nullable(),
  department: yup.string().nullable(),
  office: yup.string().nullable(),
  primaryPhone: yup.string().nullable(),
  dateStarted: yup.date().nullable(),
  dateOfBirth: yup.date().nullable(),
  isHuman: yup.bool().nullable(),
  isSuperuser: yup.bool().nullable()
});

export const PEOPLE_SELECT_QUERY = gql`
  query listPeopleForSelect($query: String!) {
    users(humansOnly: true, query: $query, limit: 10) {
      id
      name
      email
    }
  }
`;

export const PERSON_QUERY = gql`
  query getPersonForUpdate($email: String!) {
    offices {
      id
      name
    }
    users(humansOnly: false, email: $email) {
      id
      name
      email
      handle
      pronouns
      department
      title
      dateOfBirth
      dateStarted
      primaryPhone
      isHuman
      isSuperuser
      office {
        id
        name
      }
      reportsTo {
        id
        name
        email
      }
    }
  }
`;

export const PERSON_MUTATION = gql`
  mutation updatePerson($user: UUID!, $data: UserInput!) {
    updateUser(user: $user, data: $data) {
      ok
      errors
    }
  }
`;

class UpdatePersonForm extends Component {
  static propTypes = {
    email: PropTypes.string.isRequired
  };

  static contextTypes = { router: PropTypes.object.isRequired };

  loadMatchingUsers = (inputValue, callback) => {
    apolloClient
      .query({
        query: PEOPLE_SELECT_QUERY,
        variables: {
          query: inputValue
        }
      })
      .then(({ data: { users } }) => {
        callback(
          users
            .filter(u => u.email !== this.props.email)
            .map(u => ({
              value: u.id,
              label: `${u.name} <${u.email}>`
            }))
        );
      });
  };

  render() {
    const currentUser = this.props.user;
    const isRestricted = !currentUser.isSuperuser;
    const restrictedFields = new Set(["name", "email"]);
    if (isRestricted) {
      ["title", "department", "dateStarted", "dateOfBirth", "office"].forEach(k =>
        restrictedFields.add(k)
      );
    }
    if (!currentUser.isSuperuser) {
      ["isHuman", "isSuperuser"].forEach(k => restrictedFields.add(k));
    }

    return (
      <Query query={PERSON_QUERY} variables={{ email: this.props.email }}>
        {({ loading, data: { offices, users } }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          const user = users.find(
            u => u.email.toLowerCase() === this.props.email.toLowerCase()
          );
          if (!user) return <ErrorMessage message="Couldn't find that person." />;
          const initialValues = {
            name: user.name,
            email: user.email,
            handle: user.handle || "",
            pronouns: user.pronouns || "NONE",
            title: user.title || "",
            department: user.department || "",
            dateOfBirth: user.dateOfBirth || "",
            dateStarted: user.dateStarted || "",
            primaryPhone: user.primaryPhone || "",
            reportsTo: user.reportsTo
              ? {
                  value: user.reportsTo.id,
                  label: `${user.reportsTo.name} <${user.reportsTo.email}>`
                }
              : "",
            isHuman: user.isHuman,
            isSuperuser: user.isSuperuser,
            office: user.office ? user.office.id : ""
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
                    if (restrictedFields.has(k)) return;
                    let initialVal = initialValues[k];
                    let curVal = values[k];
                    if (initialVal.hasOwnProperty("value")) {
                      initialVal = initialVal.value;
                      curVal = curVal.value;
                    }
                    if (curVal !== initialVal) {
                      data[k] = curVal || "";
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
                      <h2>Personal</h2>
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
                        help="Do you have another name or nickname you prefer to go by?."
                      />
                      <FieldWrapper
                        type="select"
                        name="pronouns"
                        label="Pronouns"
                        placeholder="e.g. he / him / his"
                        options={PRONOUNS}
                        readonly={restrictedFields.has("pronouns")}
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
                        type="select"
                        name="reportsTo"
                        label="Manager"
                        loadOptions={this.loadMatchingUsers}
                        readonly={restrictedFields.has("reportsTo")}
                      />
                    </Card>

                    <Card>
                      <h2>Organization</h2>
                      <FieldWrapper
                        type="select"
                        name="office"
                        label="Office"
                        readonly={restrictedFields.has("office")}
                        options={[
                          ["", "(no office)"],
                          ...offices.map(o => [o.id, o.name])
                        ]}
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
                      <FieldWrapper
                        type="checkbox"
                        name="isSuperuser"
                        label="Superuser?"
                        readonly={restrictedFields.has("isSuperuser")}
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
