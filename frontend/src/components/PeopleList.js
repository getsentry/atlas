import React from "react";
import moment from "moment";

import Birthday from "./Birthday";
import PersonLink from "./PersonLink";

import { getColumnTitle } from "../utils/strings";

export const validColumns = new Set([
  "anniversary",
  "birthday",
  "department",
  "team",
  "email",
  "reportsTo",
  "office",
  "dateStarted",
  "social.github",
  "social.linkedin",
  "social.twitter",
  "gamerTags.nintendo",
  "gamerTags.playstation",
  "gamerTags.steam",
  "gamerTags.xbox"
]);

export const defaultColumns = ["department", "team", "office", "dateStarted"];

const getColumnValue = function(user, column) {
  switch (column) {
    case "department":
      return user.department && user.department.name;
    case "team":
      return user.team && user.team.name;
    case "office":
      return user.office && user.office.name;
    case "birthday":
      return <Birthday dobMonth={user.dobMonth} dobDay={user.dobDay} />;
    case "anniversary":
      return moment(user.dateStarted, "YYYY-MM-DD").format("MMMM Do");
    default:
      let value = user;
      column.split(".").forEach(c => {
        if (!value) return;
        value = value[c];
      });
      return value ? "" + value : null;
  }
};

export default function PeopleList({ users, columns = defaultColumns }) {
  let usedColumn = columns.filter(c => validColumns.has(c));

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          {usedColumn.map(c => (
            <th key={c}>{getColumnTitle(c)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>
              <PersonLink user={u} />
            </td>
            {usedColumn.map(c => (
              <td key={c} className={c === "email" ? "rrweb-hidden" : ""}>
                {getColumnValue(u, c)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
