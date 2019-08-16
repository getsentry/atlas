import React from "react";

export const DAY_SCHEDULE = [
  ["NONE", "(no information)"],
  ["INOFFICE", "In Office"],
  ["WFH", "Work From Home"],
  ["OFF", "Off"]
];

export default ({ daySchedule }) => (
  <React.Fragment>
    {daySchedule && DAY_SCHEDULE.find(p => p[0] === daySchedule || "NONE")[1]}
  </React.Fragment>
);
