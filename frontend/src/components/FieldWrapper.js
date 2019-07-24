import React from "react";
import styled from "@emotion/styled";
import { Field, ErrorMessage } from "formik";
import AsyncSelect from "react-select/async";
import Select from "react-select";

import colors from "../colors";

const selectStyles = {
  option: (provided, state) => {
    let background;
    let color;
    if (state.isSelected) {
      background = colors.inputBackgroundSelected;
      color = colors.inputTextSelected;
    } else if (state.isFocused) {
      background = colors.inputBackgroundFocused;
      color = colors.inputTextFocused;
    } else {
      background = colors.inputBackground;
      color = colors.inputText;
    }
    return {
      ...provided,
      background,
      color
    };
  }
};

const SelectField = ({ options, field, form }) => (
  <Select
    styles={selectStyles}
    options={options}
    name={field.name}
    value={options ? options.find(option => option.value === field.value) : ""}
    onChange={option => form.setFieldValue(field.name, option.value)}
    onBlur={field.onBlur}
  />
);

const AsyncSelectField = ({ options, field, form, loadOptions }) => (
  <AsyncSelect
    {...field}
    styles={selectStyles}
    cacheOptions
    loadOptions={loadOptions}
    name={field.name}
    defaultOptions
    onChange={option => form.setFieldValue(field.name, option)}
    onBlur={field.onBlur}
  />
);

export default styled(
  ({
    name,
    label,
    type,
    readonly,
    placeholder,
    className,
    hidden,
    options,
    help,
    loadOptions
  }) => {
    let fieldProps = {
      name,
      disabled: readonly,
      placeholder,
      hidden
    };
    if (type === "select") {
      if (loadOptions) {
        fieldProps.component = AsyncSelectField;
        fieldProps.loadOptions = loadOptions;
      } else {
        fieldProps.component = SelectField;
        fieldProps.options = options.map(([value, label]) => ({ value, label }));
      }
      fieldProps.isDisabled = !!readonly;
    } else if (type === "textarea") {
      fieldProps.component = "textarea";
    } else {
      fieldProps.type = type;
    }
    const isInlineLabel = type === "checkbox";
    return (
      <div className={className}>
        {!hidden && !isInlineLabel && <label>{label}</label>}
        {isInlineLabel ? (
          <label>
            <Field {...fieldProps} /> {label}
          </label>
        ) : (
          <Field {...fieldProps} />
        )}
        {help && (
          <div>
            <small>{help}</small>
          </div>
        )}
        <ErrorMessage name={name} />
      </div>
    );
  }
)`
  margin-bottom: 1rem;
`;
