import React from "react";
import styled from "@emotion/styled";
import { Field, ErrorMessage } from "formik";

export default styled(
  ({ name, label, type, readonly, placeholder, className, hidden, options }) => {
    let fieldProps = {
      name,
      disabled: readonly,
      placeholder,
      hidden
    };
    if (type === "select") {
      fieldProps.component = "select";
      fieldProps.children = options.map(([id, label]) => (
        <option value={id} key={id}>
          {label}
        </option>
      ));
    } else {
      fieldProps.type = type;
    }
    return (
      <div className={className}>
        {!hidden && <label>{label}</label>}
        <Field {...fieldProps} />
        <ErrorMessage name={name} />
      </div>
    );
  }
)`
  margin-bottom: 1rem;
`;
