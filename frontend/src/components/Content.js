import React from "react";
import styled from "@emotion/styled";

const ContentContainer = styled.main`
  margin: 0 0.75rem 1.5rem;
  flex-grow: 1;
`;

export default (props) => {
  return <ContentContainer {...props} />;
};
