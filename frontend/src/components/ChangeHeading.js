import React from "react";
import { Link } from "react-router";

import PersonLink from "./PersonLink";

export default ({ change, avatarSize }) => {
  switch (change.objectType.toLowerCase()) {
    case "user":
      const user = change.objectUser;
      return <PersonLink user={user} avatarSize={avatarSize} />;
    case "office":
      const office = change.objectOffice;
      return <Link to={`/offices/${office.externalId}`}>{office.name}</Link>;
    case "department":
      const department = change.objectDepartment;
      return <React.Fragment>{department.name}</React.Fragment>;
    default:
      return (
        <React.Fragment>
          `${change.objectType} - ${change.objectId}`
        </React.Fragment>
      );
  }
};
