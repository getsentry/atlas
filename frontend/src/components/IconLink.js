import React from "react";
import { Link } from "react-router";
import styled from "@emotion/styled";

import colors from "../colors";

export default styled(({ to, icon, children, className }) => {
  return (
    <Link to={to} className={className}>
      {icon} {children}
    </Link>
  );
})`
  display: flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;

  color: hsla(0, 0%, 100%, 0.7);
  transition: color 0.3s;

  &:hover {
    color: ${colors.white};
  }

  .MuiSvgIcon-root {
    font-size: 1.2em !important;
    margin-right: 0.25em;
  }
`;
