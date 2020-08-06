import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";

import Button from "../components/Button";
import Card from "../components/Card";
import FieldWrapper from "../components/FieldWrapper";
import apolloClient from "../utils/apollo";

const DepartmentSchema = yup.object().shape({
  name: yup.string().nullable(),
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

export const DEPARTMENT_DELETE_MUTATION = gql`
  mutation deleteDepartment($department: UUID!, $newDepartment: UUID!) {
    deleteDepartment(department: $department, newDepartment: $newDepartment) {
      ok
      errors
    }
  }
`;

export default class extends Component {
  static contextTypes = { router: PropTypes.object.isRequired };

  loadMatchingDepartments = (inputValue, callback) => {
    apolloClient
      .query({
        query: DEPARTMENT_SELECT_QUERY,
        variables: {
          query: inputValue,
        },
      })
      .then(({ data: { departments } }) => {
        callback(
          departments
            .filter((d) => d.id !== this.props.params.departmentId)
            .map((u) => ({
              value: u.id,
              label: u.name,
            }))
        );
      });
  };

  render() {
    return (
      <Query query={DEPARTMENT_QUERY} variables={{ id: this.props.params.departmentId }}>
        {({ loading, data: { departments } }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!departments.length)
            return <ErrorMessage message="Couldn't find that department." />;
          const department = departments[0];
          return (
            <Formik
              initialValues={{}}
              validationSchema={DepartmentSchema}
              onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
                let data = {};
                Object.keys(values).forEach((k) => {
                  let curVal = values[k];
                  if (curVal && curVal.hasOwnProperty("value")) {
                    curVal = curVal.value;
                  }
                  data[k] = curVal || "";
                });
                apolloClient
                  .mutate({
                    mutation: DEPARTMENT_DELETE_MUTATION,
                    variables: {
                      department: department.id,
                      ...data,
                    },
                  })
                  .then(
                    ({ data: { deleteDepartment }, errors }) => {
                      setSubmitting(false);
                      if (errors) {
                        setStatus({ error: "" + errors[0].message });
                      } else if (!deleteDepartment.ok) {
                        setStatus({ error: "" + deleteDepartment.errors[0] });
                      } else {
                        this.context.router.push({
                          pathname: `/admin/departments`,
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
              {({ isSubmitting, status, errors }) => (
                <Form>
                  <Card>
                    <p>
                      You are removing the <strong>{department.name}</strong> department.
                    </p>
                    <p>
                      To continue you need to select a department where any existing
                      people will be transferred to.
                    </p>
                    <p>
                      <strong>This operation cannot be undone!</strong>
                    </p>
                  </Card>
                  {status && status.error && (
                    <Card withPadding>
                      <strong>{status.error}</strong>
                    </Card>
                  )}
                  <Card>
                    <FieldWrapper
                      type="select"
                      name="newDepartment"
                      label="New Department"
                      help="Where should we transfer people to?"
                      loadOptions={this.loadMatchingDepartments}
                      required
                    />
                  </Card>

                  <Card withPadding>
                    <Button priority="danger" type="submit" disabled={isSubmitting}>
                      Save & Delete
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
