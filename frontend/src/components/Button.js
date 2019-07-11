import styled from "@emotion/styled";

import colors from "../colors";

export default styled.button`
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  cursor: pointer;
  background: ${colors.primary500};
  color: ${colors.white};
  transition: color 0.1s ease-in-out, background-color 0.1s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.1s ease-in-out;

  &:disabled {
    background: #ced4da;
  }
  &:hover {
    background: ${colors.primary};
    border-color: ${colors.primary};
    color: ${colors.white};
  }
`;
