import React from "react";

import PersonLink from "./PersonLink";

export const validColumns = new Set([
  "department",
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

export const defaultColumns = ["department", "office", "dateStarted"];

const getColumnTitle = function(column) {
  switch (column) {
    case "dateStarted":
      return "Start Date";
    default:
      let columnPieces = column.split(".");
      let columnName = columnPieces[columnPieces.length - 1];
      return columnName.substr(0, 1).toUpperCase() + columnName.substr(1);
  }
};

const getColumnValue = function(user, column) {
  switch (column) {
    case "department":
      return user.department && user.department.name;
    case "office":
      return user.office && user.office.name;
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
              <td key={c}>{getColumnValue(u, c)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
