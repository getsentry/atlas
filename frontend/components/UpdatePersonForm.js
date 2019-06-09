import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

import withApollo from "../utils/apollo";
import { PERSON_QUERY } from "../components/Person";

const RestrictedUserSchema = yup.object().shape({
  handle: yup.string()
});

const FullUserSchema = yup.object().shape({
  name: yup.string().required("Required"),
  handle: yup.string(),
  title: yup.string(),
  department: yup.string(),
  dateStarted: yup.date(),
  dateOfBirth: yup.date()
});

export const PERSON_MUTATION = gql`
  mutation updatePerson(
    $user: UUID!
    $name: String
    $handle: String
    $title: String
    $department: String
    $dateOfBirth: Date
    $dateStarted: Date
  ) {
    updateUser(
      user: $user
      name: $name
      handle: $handle
      title: $title
      department: $department
      dateOfBirth: $dateOfBirth
      dateStarted: $dateStarted
    ) {
      ok
      errors
      user {
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
          title
          dateOfBirth
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
  }
`;

const FieldWrapper = ({ name, label, type, readonly }) => {
  return (
    <div>
      <label>{label}</label>
      <Field type={type} name={name} disabled={readonly} />
      <ErrorMessage name={name} />
      <style jsx>{`
        div {
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

class UpdatePersonForm extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };

  render() {
    return (
      <Query query={PERSON_QUERY} variables={{ id: this.props.id }}>
        {({ loading, error, data }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!data.users.length)
            return <ErrorMessage message="Couldn't find that person." />;
          const user = data.users[0];
          const isRestricted = true;
          const initialValues = {
            name: user.name,
            handle: user.profile.handle,
            title: user.profile.title,
            department: user.profile.department,
            dateOfBirth: user.profile.dateOfBirth,
            dateStarted: user.profile.dateStarted
          };
          return (
            <section>
              <style jsx>
                {`
                  h1 {
                    margin-bottom: 0;
                  }
                  h2 {
                    margin-top: 1rem;
                  }
                `}
              </style>
              <h1>Update Profile</h1>
              <Formik
                initialValues={initialValues}
                validationSchema={FullUserSchema}
                onSubmit={(values, { setSubmitting }) => {
                  setTimeout(() => {
                    this.props.apolloClient.mutate({
                      mutation: PERSON_MUTATION,
                      variables: {
                        user: this.props.id,
                        ...values
                      }
                    });
                    setSubmitting(false);
                  }, 400);
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <h2>Basics</h2>
                    <FieldWrapper
                      type="text"
                      name="name"
                      label="Name (Given)"
                      readonly={isRestricted}
                    />
                    <FieldWrapper
                      type="text"
                      name="handle"
                      label="Name (Preferred)"
                    />
                    <FieldWrapper
                      type="date"
                      name="dateOfBirth"
                      label="Date of Birth"
                      readonly={isRestricted}
                    />

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

                    <button type="submit" disabled={isSubmitting}>
                      Submit
                    </button>
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

export default withApollo(UpdatePersonForm);
