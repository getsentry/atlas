import React, { Component } from "react";
import gql from "graphql-tag";

import apolloClient from "../utils/apollo";
import Button from "../components/Button";
import Card from "../components/Card";

export const EXPORT_PEOPLE_QUERY = gql`
  query exportPeople($offset: Int, $limit: Int) {
    users(offset: $offset, limit: $limit) {
      id
      name
      email
      department {
        id
        name
      }
      isHuman
      title
      dateStarted
      reportsTo {
        email
      }
    }
  }
`;

const convertValue = value => {
  if (value === false) {
    return "false";
  } else if (value === true) {
    return "true";
  } else if (value === 0) {
    return "0";
  } else if (!value) {
    return "";
  } else {
    return '"' + value.replace(/"/g, '""') + '"';
  }
};

const downloadCsv = (rows, filename) => {
  let data = rows.map(row => row.map(convertValue).join(",")).join("\r\n");

  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(data, filename);
  } else {
    //In FF link must be added to DOM to be clicked
    let link = document.createElement("a");
    let blob = new Blob(["\ufeff", data]);
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default class ImportExportPeople extends Component {
  export = () => {
    apolloClient
      .query({
        query: EXPORT_PEOPLE_QUERY,
        variables: { limit: 1000 }
      })
      .then(response => {
        const { users } = response.data;
        if (users) {
          downloadCsv(
            [
              [
                "id",
                "name",
                "email",
                "date_started",
                "title",
                "reports_to",
                "department",
                "employee_type",
                "is_human"
              ],
              ...users.map(u => [
                u.id,
                u.name,
                u.email,
                u.dateStarted,
                u.title,
                u.reportsTo ? u.reportsTo.email : "",
                u.department ? u.department.name : "",
                u.employee_type,
                u.is_human
              ])
            ],
            `people-${new Date().getTime()}.csv`
          );
        } else {
          throw new Error("Error exporting people");
        }
      })
      .catch(err => {
        throw err;
      });
  };

  render() {
    return (
      <section>
        <Card>
          <h1>Import/Export People</h1>
        </Card>
        <Card withPadding>
          <ul>
            <li>
              <Button onClick={this.export}>Export People</Button>
            </li>
          </ul>
        </Card>
      </section>
    );
  }
}
