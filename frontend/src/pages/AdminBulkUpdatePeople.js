import React, { Component } from "react";
import { Query } from "react-apollo";
import { Formik, Form, Field } from "formik";
import gql from "graphql-tag";

import apolloClient from "../utils/apollo";
import Button from "../components/Button";
import Card from "../components/Card";
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

export default class AdminBulkUpdatePeople extends Component {
  render() {
    return (
      <Card>
        <h1>Update People</h1>
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
                  department: u.department || "",
                  dateOfBirth: u.dateOfBirth || "",
                  dateStarted: u.dateStarted || "",
                  isHuman: u.isHuman
                })
            );
            return (
              <section>
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
                      <table>
                        <thead>
                          <tr>
                            <th>Person</th>
                            <th width={100}>Human?</th>
                            <th width={200}>Title</th>
                            <th width={200}>Department</th>
                            <th width={200}>Date Started</th>
                            <th width={200}>Date of Birth</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u.id}>
                              <td>
                                {u.name} <small>&lt;{u.email}&gt;</small>
                              </td>
                              <td>
                                <Field type="checkbox" name={`users[${u.id}][isHuman]`} />
                              </td>
                              <td>
                                <Field
                                  type="text"
                                  name={`users[${u.id}][title]`}
                                  placeholder="title"
                                />
                              </td>
                              <td>
                                <Field
                                  type="text"
                                  name={`users[${u.id}][department]`}
                                  placeholder="department"
                                />
                              </td>
                              <td>
                                <Field type="date" name={`users[${u.id}][dateStarted]`} />
                              </td>
                              <td>
                                <Field type="date" name={`users[${u.id}][dateOfBirth]`} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
      </Card>
    );
  }
}
