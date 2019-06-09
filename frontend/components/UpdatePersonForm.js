import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";

import { PERSON_QUERY } from "../components/Person";

const FieldWrapper = ({ name, label, type }) => {
  return (
    <div>
      <label>{label}</label>
      <Field type={type} name={name} />
      <ErrorMessage name={name} />
    </div>
  );
};

const RestrictedUserSchema = yup.object().shape({
  profile: {
    handle: yup.string()
  }
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
  mutation updatePerson($id: UUID!) {
    updateUser(id: $id) {
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
`;

export default class UpdatePerson extends Component {
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
                    alert(JSON.stringify(values, null, 2));
                    setSubmitting(false);
                  }, 400);
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <h2>Basics</h2>
                    <FieldWrapper type="text" name="name" label="Name (Gven)" />
                    <FieldWrapper
                      type="text"
                      name="handle"
                      label="Name (Preferred)"
                    />
                    <FieldWrapper
                      type="date"
                      name="dateOfBirth"
                      label="Date of Birth"
                    />

                    <h2>Role</h2>
                    <FieldWrapper type="text" name="title" label="Title" />
                    <FieldWrapper
                      type="text"
                      name="department"
                      label="Department"
                    />
                    <FieldWrapper
                      type="date"
                      name="dateStarted"
                      label="Start Date"
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
