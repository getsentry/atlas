import React from "react";
import styled from "@emotion/styled";

const ErrorBox = styled.aside`
  background: #fff;
  padding: 10px 20px;
`;

export default ({ message }) => <ErrorBox>{message}</ErrorBox>;
