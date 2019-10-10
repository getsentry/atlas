import React, { Component } from "react";
import PropTypes from "prop-types";
import { Formik, Form } from "formik";
import * as yup from "yup";

import Button from "../components/Button";
import Card from "../components/Card";
import FieldWrapper from "../components/FieldWrapper";
import apolloClient from "../utils/apollo";
import { CREATE_DEPARTMENT_MUTATION, SELECT_DEPARTMENT_QUERY } from "../queries";

const DepartmentSchema = yup.object().shape({
  name: yup.string().nullable()
});

export default class extends Component {
  static contextTypes = { router: PropTypes.object.isRequired };

  loadMatchingDepartments = (inputValue, callback) => {
    apolloClient
      .query({
        query: SELECT_DEPARTMENT_QUERY,
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
    const initialValues = {};
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
              mutation: CREATE_DEPARTMENT_MUTATION,
              variables: {
                data
              }
            })
            .then(
              ({ data: { createDepartment }, errors }) => {
                setSubmitting(false);
                if (errors) {
                  setStatus({ error: "" + errors[0].message });
                } else if (!createDepartment.ok) {
                  setStatus({ error: "" + createDepartment.errors[0] });
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
  }
}
