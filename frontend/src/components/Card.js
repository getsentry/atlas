import styled from "@emotion/styled";

export default styled.div`
  background: #fff;
  padding: 1rem 1rem 0;
  margin: 0 0 1.5rem;
  overflow: visible;
  border-radius: 4px;
  padding-bottom: ${props => (props.withPadding ? "1rem" : 0)};

  ::after {
    content: "";
    clear: both;
    display: table;
  }
`;
