import React from "react";
import styled from "@emotion/styled";
import { Field, ErrorMessage } from "formik";

export default styled(
  ({ name, label, type, readonly, placeholder, className, hidden }) => {
    return (
      <div className={className}>
        {!hidden && <label>{label}</label>}
        <Field
          type={type}
          name={name}
          disabled={readonly}
          placeholder={placeholder}
          hidden={hidden}
        />
        <ErrorMessage name={name} />
      </div>
    );
  }
)`
  margin-bottom: 1rem;
`;
