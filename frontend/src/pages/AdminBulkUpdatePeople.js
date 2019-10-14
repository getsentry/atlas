import React, { Component } from "react";
import { Query } from "react-apollo";
import { Formik, Form, Field } from "formik";
import gql from "graphql-tag";
import styled from "@emotion/styled";

import apolloClient from "../utils/apollo";
import Button from "../components/Button";
import colors from "../colors";
import Card from "../components/Card";
import DepartmentSelectField from "../components/DepartmentSelectField";
import PageLoader from "../components/PageLoader";
import { LIST_PEOPLE_QUERY } from "../queries";

export const BULK_PERSON_MUTATION = gql`
  mutation updatePeople($data: [UserInput]!) {
    updatePeople(data: $data) {
      ok
      errors
    }
  }
`;

const StyledTable = styled.table`
  border-spacing: 0;

  tbody {
    tr td {
      background: ${colors.cardBackground};
    }
    tr:nth-child(4n) td,
    tr:nth-child(4n - 1) td {
      background: ${colors.black};
    }
  }
`;

export default class AdminBulkUpdatePeople extends Component {
  render() {
    return (
      <section>
        <Card>
          <h1>Update People</h1>
        </Card>
        <Query
          query={LIST_PEOPLE_QUERY}
          variables={{
            humansOnly: false,
            limit: 1000
          }}
        >
          {({ loading, error, data }) => {
            if (error) throw error;
            if (loading) return <PageLoader />;
            const { users } = data;
            const initialValues = {
              users: {}
            };
            users.forEach(
              u =>
                (initialValues.users[u.id] = {
                  title: u.title || "",
                  department: u.department
                    ? {
                        value: u.department.id,
                        label: u.department.name
                      }
                    : "",
                  dateOfBirth: u.dateOfBirth || "",
                  dateStarted: u.dateStarted || ""
                })
            );
            return (
              <Formik
                initialValues={initialValues}
                onSubmit={({ users }, { setErrors, setStatus, setSubmitting }) => {
                  let data = [];
                  Object.keys(users).forEach(id => {
                    let userData = { id };
                    let changes = false;
                    Object.keys(users[id]).forEach(k => {
                      let initialVal = initialValues.users[id][k];
                      let curVal = users[id][k];
                      if (curVal.hasOwnProperty("value")) {
                        initialVal = initialVal ? initialVal.value : null;
                        curVal = curVal.value;
                      }
                      if (curVal !== initialVal) {
                        userData[k] = curVal || "";
                        changes = true;
                      }
                    });
                    if (changes) data.push(userData);
                  });
                  apolloClient
                    .mutate({
                      mutation: BULK_PERSON_MUTATION,
                      variables: {
                        data
                      }
                    })
                    .then(
                      ({
                        data: {
                          updatePeople: { ok, errors }
                        }
                      }) => {
                        setSubmitting(false);
                        if (!ok) {
                          setStatus({ error: "" + errors[0] });
                        } else {
                          window.location.reload();
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
                      <StyledTable>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Department</th>
                            <th width={160}>Date Started</th>
                            <th width={160}>Date of Birth</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <React.Fragment key={u.id}>
                              <tr>
                                <td colSpan={5}>
                                  {u.name} <small>&lt;{u.email}&gt;</small>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <Field
                                    type="text"
                                    name={`users[${u.id}][title]`}
                                    placeholder="title"
                                  />
                                </td>
                                <td>
                                  <DepartmentSelectField
                                    label=""
                                    name={`users[${u.id}][department]`}
                                    noMargin
                                  />
                                </td>
                                <td>
                                  <Field
                                    type="date"
                                    name={`users[${u.id}][dateStarted]`}
                                  />
                                </td>
                                <td>
                                  <Field
                                    type="date"
                                    name={`users[${u.id}][dateOfBirth]`}
                                  />
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </StyledTable>
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
      </section>
    );
  }
}
