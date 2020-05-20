import React from "react";
import { Link } from "react-router";
import styled from "@emotion/styled";

import colors from "../colors";

export default styled(
  ({
    className,
    to,
    children,
    noMargin = false,
    withPadding = false,
    slim = false,
    ...props
  }) => {
    return (
      <div className={className} {...props}>
        {to ? <Link to={to}>{children}</Link> : children}
      </div>
    );
  }
)`
  background: ${colors.cardBackground};
  color: ${colors.cardText};
  padding: ${props => (props.slim ? "0.5rem" : "1rem")} 1rem 0;
  margin: 0 0 ${props => (props.noMargin ? 0 : "1.5rem")};
  overflow: visible;
  border-radius: 4px;
  padding-bottom: ${props => (props.withPadding ? (props.slim ? "0.5rem" : "1rem") : 0)};

  ${props =>
      props.to &&
      `
  & > a {
    color: inherit;
    display: block;
    padding: ${props.slim ? "0.5rem 1rem" : "1rem 1rem"} 0;
    padding-bottom: ${props.withPadding ? (props.slim ? "0.5rem" : "1rem") : 0};
    margin: ${props.slim ? "-0.5rem -1rem" : "-1rem -1rem"} 0;
    margin-bottom: ${props.withPadding ? (props.slim ? "-0.5rem" : "-1rem") : 0};

    &:hover {
      background: ${colors.cardBackgroundHover};
    }
  }
  `}
    ::after {
    content: "";
    clear: both;
    display: table;
  }
`;
