import React from "react";

export const PRONOUNS = [
  ["NONE", ""],
  ["HE_HIM", "he / him"],
  ["SHE_HER", "she / her"],
  ["THEY_THEM", "they / them"],
  ["OTHER", "other"],
  ["DECLINE", "decline to choose"]
];

export default ({ pronouns }) => (
  <React.Fragment>{PRONOUNS.find(p => p[0] === pronouns)[1]}</React.Fragment>
);
