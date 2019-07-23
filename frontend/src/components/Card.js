import React from "react";
import { Link } from "react-router";
import styled from "@emotion/styled";

import colors from "../colors";

export default styled(({ className, to, children }) => {
  return (
    <div className={className}>{to ? <Link to={to}>{children}</Link> : children}</div>
  );
})`
  background: ${colors.cardBackground};
  color: ${colors.cardText};
  padding: 1rem 1rem 0;
  margin: 0 0 1.5rem;
  overflow: visible;
  border-radius: 4px;
  padding-bottom: ${props => (props.withPadding ? "1rem" : 0)};

  ${props =>
    props.to &&
    `
  & > a {
    color: inherit;
    display: block;
    padding: 1rem 1rem 0;
    padding-bottom: ${props.withPadding ? "1rem" : 0};
    margin: -1rem -1rem 0;
    margin-bottom: ${props.withPadding ? "-1rem" : 0};

    &:hover {
      background: ${colors.primary100};
    }
  }
  `}

  ::after {
    content: "";
    clear: both;
    display: table;
  }
`;
