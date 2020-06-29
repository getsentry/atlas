import React from "react";
import moment from "moment";

export default ({ dobMonth, dobDay }) => {
  if (!dobMonth || !dobDay) return null;
  const dob = moment(`${new Date().getFullYear()}-${dobMonth}-${dobDay}`, "YYYY-MM-DD");
  return <React.Fragment>{dob.format("MMMM Do")}</React.Fragment>;
};
