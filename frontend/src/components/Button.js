import { css } from "@emotion/core";
import styled from "@emotion/styled";
import { Link } from "react-router";

import colors from "../colors";

export const buttonStyles = props => css`
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
  cursor: pointer;
  background: ${colors.white};
  color: ${colors.primary};
  border-color: ${colors.primary};
  transition: color 0.1s ease-in-out, background-color 0.1s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.1s ease-in-out;

  svg {
    vertical-align: top;
    margin-right: 5px;
  }

  &:disabled {
    background: #ced4da;
  }
  &:hover {
    background: ${colors.primary};
    border-color: ${colors.primary};
    color: ${colors.white};
  }
  ${props.priority === "danger" &&
    `
    color: ${colors.red};
    border-color: ${colors.red};

    &:hover {
      background: ${colors.red};
      border-color: ${colors.red};
      }
    }
  `}
`;

export const ButtonLink = styled(Link)`
  ${buttonStyles}
`;

export default styled.button`
  ${buttonStyles}
`;
