import React from "react";
import { Link } from "react-router";
import styled from "@emotion/styled";

import colors from "../colors";

export default styled(({ to, icon, children, className, style }) => {
  return (
    <Link to={to} className={className} style={style}>
      {icon} {children}
    </Link>
  );
})`
  display: flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;

  color: ${(props) => props.color || "hsla(0, 0%, 100%, 0.7)"};
  transition: color 0.3s;

  &:hover {
    color: ${(props) => props.colorHover || props.color || colors.white};
  }

  .MuiSvgIcon-root {
    font-size: 1.2em !important;
    ${(props) => props.children && "margin-right: 0.25em"};
  }
`;
