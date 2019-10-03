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

const DepartmentSchema = yup.object().shape({
  name: yup.string().nullable()
});

export const DEPARTMENT_SELECT_QUERY = gql`
  query listDepartmentsForSelect($query: String!) {
    departments(query: $query, limit: 10) {
      id
      name
    }
  }
`;

export const DEPARTMENT_QUERY = gql`
  query getDepartmentForUpdate($id: UUID!) {
    departments(id: $id) {
      id
      name
      parent {
        id
        name
      }
    }
  }
`;

export const DEPARTMENT_MUTATION = gql`
  mutation updateDepartment($department: UUID!, $data: DepartmentInput!) {
    updateDepartment(department: $department, data: $data) {
      ok
      errors
    }
  }
`;

class UpdateDepartment extends Component {
  static propTypes = {
    email: PropTypes.string.isRequired,
    onboarding: PropTypes.bool
  };

  static contextTypes = { router: PropTypes.object.isRequired };

  loadMatchingDepartments = (inputValue, callback) => {
    apolloClient
      .query({
        query: DEPARTMENT_SELECT_QUERY,
        variables: {
          query: inputValue
        }
      })
      .then(({ data: { departments } }) => {
        callback([
          {
            value: "",
            label: "(no parent)"
          },
          ...departments.map(u => ({
            value: u.id,
            label: u.name
          }))
        ]);
      });
  };

  render() {
    return (
      <Query query={DEPARTMENT_QUERY} variables={{ id: this.props.params.departmentId }}>
        {({ loading, data: { departments } }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!departments.length)
            return <ErrorMessage message="Couldn't find that person." />;
          const department = departments[0];
          const initialValues = {
            id: department.id,
            name: department.name,
            parent: department.parent
              ? {
                  value: department.parent.id,
                  label: department.parent.name
                }
              : {
                  value: "",
                  label: "(no parent)"
                }
          };
          return (
            <Formik
              initialValues={initialValues}
              validationSchema={DepartmentSchema}
              onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
                let data = {};
                Object.keys(values).forEach(k => {
                  let initialVal = initialValues[k];
                  let curVal = values[k];
                  if (curVal && curVal.hasOwnProperty("value")) {
                    initialVal = initialVal ? initialVal.value : null;
                    curVal = curVal.value;
                  }
                  if (curVal !== initialVal) {
                    data[k] = curVal || "";
                  }
                });
                apolloClient
                  .mutate({
                    mutation: DEPARTMENT_MUTATION,
                    variables: {
                      department: department.id,
                      data
                    }
                  })
                  .then(
                    ({ data: { updateDepartment }, errors }) => {
                      setSubmitting(false);
                      if (errors) {
                        setStatus({ error: "" + errors[0].message });
                      } else if (!updateDepartment.ok) {
                        setStatus({ error: "" + updateDepartment.errors[0] });
                      } else {
                        this.context.router.push({
                          pathname: `/admin/departments`
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
              {({ isSubmitting, status, errors }) => (
                <Form>
                  {status && status.error && (
                    <Card withPadding>
                      <strong>{status.error}</strong>
                    </Card>
                  )}
                  <Card>
                    <FieldWrapper type="text" name="id" label="ID" readonly required />
                    <FieldWrapper type="text" name="name" label="Name" required />
                    <FieldWrapper
                      type="select"
                      name="parent"
                      label="Parent"
                      loadOptions={this.loadMatchingDepartments}
                    />
                  </Card>

                  <Card withPadding>
                    <Button type="submit" disabled={isSubmitting}>
                      Save Changes
                    </Button>
                  </Card>
                </Form>
              )}
            </Formik>
          );
        }}
      </Query>
    );
  }
}

export default connect(({ auth }) => ({
  user: auth.user
}))(UpdateDepartment);
