import React, { Component } from "react";
import { Query } from "react-apollo";
import { Formik, Form } from "formik";
import { Flex, Box } from "@rebass/grid/emotion";
import gql from "graphql-tag";

import apolloClient from "../utils/apollo";
import Button from "../components/Button";
import Card from "../components/Card";
import FieldWrapper from "../components/FieldWrapper";
import DepartmentSelectField from "../components/DepartmentSelectField";
import PersonSelectField from "../components/PersonSelectField";
import PageLoader from "../components/PageLoader";

export const LIST_PEOPLE_QUERY = gql`
  query listPeopleForUpdate {
    users(humansOnly: true, limit: 1000) {
      id
      name
      email
      department {
        id
        name
        costCenter
        tree {
          name
          costCenter
        }
      }
      isHuman
      isDirectoryHidden
      title
      dobMonth
      dobDay
      dateStarted
      photo {
        data
        width
        height
        mimeType
      }
      reportsTo {
        id
        name
        email
        photo {
          data
          width
          height
          mimeType
        }
      }
    }
  }
`;

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
      <section>
        <Card>
          <h1>Update People</h1>
        </Card>
        <Query query={LIST_PEOPLE_QUERY}>
          {({ loading, error, data }) => {
            if (error) throw error;
            if (loading) return <PageLoader />;
            const users = data.users.results;
            const initialValues = {
              users: {}
            };
            users.forEach(
              u =>
                (initialValues.users[u.id] = {
                  title: u.title || "",
                  department: u.department,
                  reportsTo: u.reportsTo,
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
                    if (userData.organization)
                      userData.organization = userData.organization.id;
                    if (userData.reportsTo) userData.reportsTo = userData.reportsTo.id;
                    if (userData.referredBy) userData.referredBy = userData.referredBy.id;
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
                    {users.map(u => (
                      <Card key={u.id} withPadding>
                        <h4>
                          {u.name} <span>&lt;{u.email}&gt;</span>
                        </h4>
                        <Flex mx={-3} mb={3}>
                          <Box width={1 / 2} mx={3}>
                            <FieldWrapper
                              type="text"
                              label="Title"
                              name={`users[${u.id}][title]`}
                              placeholder="title"
                              noMargin
                            />
                          </Box>
                          <Box width={1 / 2} mx={3}>
                            <DepartmentSelectField
                              name={`users[${u.id}][department]`}
                              noMargin
                            />
                          </Box>
                        </Flex>
                        <Flex mx={-3}>
                          <Box width={1 / 2} mx={3}>
                            <PersonSelectField
                              label="Manager"
                              name={`users[${u.id}][reportsTo]`}
                              exclude={u.id}
                              noMargin
                            />
                          </Box>
                          <Box width={1 / 2} mx={3}>
                            <FieldWrapper
                              label="Date Started"
                              type="date"
                              name={`users[${u.id}][dateStarted]`}
                              noMargin
                            />
                          </Box>
                        </Flex>
                      </Card>
                    ))}
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
