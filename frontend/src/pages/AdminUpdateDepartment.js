import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";

import Button, { ButtonLink } from "../components/Button";
import Card from "../components/Card";
import DepartmentSelectField from "../components/DepartmentSelectField";
import FieldWrapper from "../components/FieldWrapper";
import apolloClient from "../utils/apollo";
import { GET_DEPARTMENT_QUERY, UPDATE_DEPARTMENT_MUTATION } from "../queries";

const DepartmentSchema = yup.object().shape({
  name: yup.string().nullable()
});

export default class extends Component {
  static contextTypes = { router: PropTypes.object.isRequired };

  render() {
    return (
      <Query
        query={GET_DEPARTMENT_QUERY}
        variables={{ id: this.props.params.departmentId }}
      >
        {({ loading, data: { departments } }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          if (!departments.length)
            return <ErrorMessage message="Couldn't find that department." />;
          const department = departments[0];
          const initialValues = {
            id: department.id,
            name: department.name,
            costCenter: department.costCenter,
            parent: department.parent
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
                    mutation: UPDATE_DEPARTMENT_MUTATION,
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
                    <DepartmentSelectField
                      name="parent"
                      label="Parent"
                      exclude={department.id}
                    />
                    <FieldWrapper type="number" name="costCenter" label="Cost Center" />
                  </Card>

                  <Card withPadding>
                    <Button type="submit" disabled={isSubmitting}>
                      Save Changes
                    </Button>
                    <ButtonLink
                      priority="danger"
                      to={`/admin/departments/${department.id}/delete`}
                      disabled={isSubmitting}
                    >
                      Delete
                    </ButtonLink>
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
