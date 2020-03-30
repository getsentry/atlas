import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Formik, Form, ErrorMessage } from "formik";
import * as yup from "yup";

import Button from "../components/Button";
import Card from "../components/Card";
import { DAY_SCHEDULE } from "../components/DaySchedule";
import DepartmentSelectField from "../components/DepartmentSelectField";
import FieldWrapper from "../components/FieldWrapper";
import PersonSelectField from "../components/PersonSelectField";
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
  isDirectoryHidden: yup.bool().nullable(),
  isSuperuser: yup.bool().nullable()
});

export const PERSON_QUERY = gql`
  query getPersonForUpdate($email: String!) {
    offices {
      id
      name
    }
    employeeTypes {
      id
      name
    }
    users(humansOnly: false, email: $email, includeHidden: true) {
      results {
        id
        name
        email
        handle
        bio
        pronouns
        department {
          id
          name
          costCenter
          tree {
            name
            costCenter
          }
        }
        title
        dateOfBirth
        dateStarted
        primaryPhone
        employeeType {
          id
          name
        }
        isHuman
        isDirectoryHidden
        isSuperuser
        schedule {
          sunday
          monday
          tuesday
          wednesday
          thursday
          friday
          saturday
        }
        social {
          linkedin
          github
          twitter
        }
        gamerTags {
          steam
          xbox
          playstation
          nintendo
        }
        office {
          id
          name
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
        referredBy {
          id
          name
          email
        }
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
    email: PropTypes.string.isRequired,
    onboarding: PropTypes.bool
  };

  static contextTypes = { router: PropTypes.object.isRequired };

  render() {
    const currentUser = this.props.user;
    const isRestricted = !currentUser.isSuperuser;
    const restrictedFields = new Set(["name", "email"]);
    if (isRestricted) {
      [
        "title",
        "department",
        "dateStarted",
        "dateOfBirth",
        "office",
        "employeeType",
        "referredBy",
        "reportsTo"
      ].forEach(k => restrictedFields.add(k));
    }
    if (!currentUser.isSuperuser) {
      ["isHuman", "isDirectoryHidden", "isSuperuser"].forEach(k =>
        restrictedFields.add(k)
      );
    }

    return (
      <Query query={PERSON_QUERY} variables={{ email: this.props.email }}>
        {({ loading, data: { employeeTypes, offices, users } }) => {
          //if (error) return <ErrorMessage message="Error loading person." />;
          if (loading) return <div>Loading</div>;
          const user = users.results.find(
            u => u.email.toLowerCase() === this.props.email.toLowerCase()
          );
          if (!user) return <ErrorMessage message="Couldn't find that person." />;
          const initialValues = {
            name: user.name,
            email: user.email,
            handle: user.handle || "",
            bio: user.bio || "",
            pronouns: user.pronouns || "NONE",
            title: user.title || "",
            department: user.department,
            dateOfBirth: user.dateOfBirth || "",
            dateStarted: user.dateStarted || "",
            primaryPhone: user.primaryPhone || "",
            reportsTo: user.reportsTo,
            referredBy: user.referredBy,
            isHuman: user.isHuman,
            isDirectoryHidden: user.isDirectoryHidden,
            employeeType: user.employeeType ? user.employeeType.id : "",
            isSuperuser: user.isSuperuser || false,
            office: user.office ? user.office.id : "",
            social: {
              twitter: user.social.twitter || "",
              linkedin: user.social.linkedin || "",
              github: user.social.github || ""
            },
            gamerTags: {
              steam: user.gamerTags.steam || "",
              xbox: user.gamerTags.xbox || "",
              playstation: user.gamerTags.playstation || "",
              nintendo: user.gamerTags.nintendo || ""
            },
            schedule: {
              sunday: user.schedule.sunday || "NONE",
              monday: user.schedule.monday || "NONE",
              tuesday: user.schedule.tuesday || "NONE",
              wednesday: user.schedule.wednesday || "NONE",
              thursday: user.schedule.thursday || "NONE",
              friday: user.schedule.friday || "NONE",
              saturday: user.schedule.saturday || "NONE"
            }
          };
          return (
            <Formik
              initialValues={initialValues}
              validationSchema={UserSchema}
              onSubmit={(values, { setErrors, setStatus, setSubmitting }) => {
                let data = {};
                Object.keys(values).forEach(k => {
                  if (restrictedFields.has(k)) return;
                  let initialVal = initialValues[k];
                  let curVal = values[k];
                  if (curVal !== initialVal) {
                    data[k] = curVal || "";
                  }
                });
                if (data.organization) data.organization = data.organization.id;
                if (data.reportsTo) data.reportsTo = data.reportsTo.id;
                if (data.referredBy) data.referredBy = data.referredBy.id;
                apolloClient
                  .mutate({
                    mutation: PERSON_MUTATION,
                    variables: {
                      user: user.id,
                      data
                    }
                  })
                  .then(
                    ({ data: { updateUser }, errors }) => {
                      setSubmitting(false);
                      if (errors) {
                        setStatus({ error: "" + errors[0].message });
                      } else if (!updateUser.ok) {
                        setStatus({ error: "" + updateUser.errors[0] });
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
              {({ isSubmitting, status, errors }) => (
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
                      required
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
                      required
                    />
                    <FieldWrapper
                      type="textarea"
                      name="bio"
                      label="Bio"
                      readonly={restrictedFields.has("bio")}
                      help="A bit about yourself."
                    />
                    <FieldWrapper
                      type="email"
                      name="email"
                      label="Email"
                      className="rrweb-hidden"
                      readonly={restrictedFields.has("email")}
                      required
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

                  {!this.props.onboarding && (
                    <Card>
                      <h2>Role</h2>
                      <FieldWrapper
                        type="select"
                        name="employeeType"
                        label="Employee Type"
                        options={[
                          ["", "(none)"],
                          ...employeeTypes.map(o => [o.id, o.name])
                        ]}
                        readonly={restrictedFields.has("employeeType")}
                      />
                      <FieldWrapper
                        type="text"
                        name="title"
                        label="Title"
                        readonly={restrictedFields.has("title")}
                      />
                      <PersonSelectField
                        name="reportsTo"
                        label="Manager"
                        exclude={user.id}
                        readonly={restrictedFields.has("reportsTo")}
                      />
                      <DepartmentSelectField
                        name="department"
                        label="Department"
                        readonly={restrictedFields.has("department")}
                      />
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
                      <PersonSelectField
                        name="referredBy"
                        label="Referred By"
                        exclude={user.id}
                        readonly={restrictedFields.has("referredBy")}
                      />
                    </Card>
                  )}

                  <Card>
                    <h2>Working Schedule</h2>
                    <FieldWrapper
                      type="select"
                      name="schedule[sunday]"
                      options={DAY_SCHEDULE}
                      label="Sunday"
                      readonly={restrictedFields.has("schedule")}
                      required
                    />
                    <FieldWrapper
                      type="select"
                      name="schedule[monday]"
                      options={DAY_SCHEDULE}
                      label="Monday"
                      readonly={restrictedFields.has("schedule")}
                      required
                    />
                    <FieldWrapper
                      type="select"
                      name="schedule[tuesday]"
                      options={DAY_SCHEDULE}
                      label="Tuesday"
                      readonly={restrictedFields.has("schedule")}
                      required
                    />
                    <FieldWrapper
                      type="select"
                      name="schedule[wednesday]"
                      options={DAY_SCHEDULE}
                      label="wednesday"
                      readonly={restrictedFields.has("schedule")}
                      required
                    />
                    <FieldWrapper
                      type="select"
                      name="schedule[thursday]"
                      options={DAY_SCHEDULE}
                      label="Thursday"
                      readonly={restrictedFields.has("schedule")}
                      required
                    />
                    <FieldWrapper
                      type="select"
                      name="schedule[friday]"
                      options={DAY_SCHEDULE}
                      label="Friday"
                      readonly={restrictedFields.has("schedule")}
                      required
                    />
                    <FieldWrapper
                      type="select"
                      name="schedule[saturday]"
                      options={DAY_SCHEDULE}
                      label="Saturday"
                      readonly={restrictedFields.has("schedule")}
                      required
                    />
                  </Card>

                  <Card>
                    <h2>#social</h2>
                    <FieldWrapper
                      type="text"
                      name="social[linkedin]"
                      label="LinkedIn"
                      help="Your LinkedIn username."
                      readonly={restrictedFields.has("social[linkedin]")}
                    />
                    <FieldWrapper
                      type="text"
                      name="social[github]"
                      label="GitHub"
                      help="Your GitHub username."
                      readonly={restrictedFields.has("social[github]")}
                    />
                    <FieldWrapper
                      type="text"
                      name="social[twitter]"
                      label="Twitter"
                      help="Your Twitter username."
                      readonly={restrictedFields.has("social[twitter]")}
                    />
                  </Card>

                  <Card>
                    <h2>#z-gamers</h2>
                    <FieldWrapper
                      type="text"
                      name="gamerTags[steam]"
                      label="Steam"
                      help="Your Steam username."
                      readonly={restrictedFields.has("gamerTags[steam]")}
                    />
                    <FieldWrapper
                      type="text"
                      name="gamerTags[xbox]"
                      label="Xbox Live"
                      help="Your Xbox Live username."
                      readonly={restrictedFields.has("gamerTags[xbox]")}
                    />
                    <FieldWrapper
                      type="text"
                      name="gamerTags[playstation]"
                      label="PlayStation"
                      help="Your PlayStation username."
                      readonly={restrictedFields.has("gamerTags[playstation]")}
                    />
                    <FieldWrapper
                      type="text"
                      name="gamerTags[nintendo]"
                      label="Nintendo"
                      placeholder="SW-XXXX-XXXX-XXXX"
                      help="Your Nintendo friend code."
                      readonly={restrictedFields.has("gamerTags[nintendo]")}
                    />
                  </Card>

                  {!this.props.onboarding && currentUser.isSuperuser && (
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
                        name="isDirectoryHidden"
                        label="Hidden in Directory?"
                        readonly={restrictedFields.has("isDirectoryHidden")}
                        help="Should this user be hidden in the directory? Useful for personnel who are no longer part of the organization."
                      />
                      <FieldWrapper
                        type="checkbox"
                        name="isSuperuser"
                        label="Superuser?"
                        readonly={restrictedFields.has("isSuperuser")}
                      />
                    </Card>
                  )}

                  <Card withPadding>
                    <Button type="submit" disabled={isSubmitting}>
                      Continue
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
}))(UpdatePersonForm);
