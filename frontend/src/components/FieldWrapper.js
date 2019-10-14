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

const SelectField = ({ field, form, options, ...fieldOptions }) => (
  <Select
    {...field}
    formatOptionLabel={fieldOptions.formatOptionLabel}
    styles={selectStyles}
    options={options}
    name={field.name}
    isClearable={!fieldOptions.required}
    isDisabled={fieldOptions.disabled}
    value={options ? options.find(option => option.value === field.value) : ""}
    onChange={option => form.setFieldValue(field.name, option ? option.value : "")}
    onBlur={field.onBlur}
  />
);

const AsyncSelectField = ({ field, form, loadOptions, ...fieldOptions }) => {
  return (
    <AsyncSelect
      {...field}
      formatOptionLabel={fieldOptions.formatOptionLabel}
      styles={selectStyles}
      cacheOptions
      loadOptions={loadOptions}
      isClearable={!fieldOptions.required}
      isDisabled={fieldOptions.disabled}
      name={field.name}
      defaultOptions
      onChange={option => form.setFieldValue(field.name, option)}
      onBlur={field.onBlur}
    />
  );
};

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
    required,
    ...fieldOptions
  }) => {
    let fieldProps = {
      name,
      disabled: readonly,
      placeholder,
      hidden,
      required: required || false,
      ...fieldOptions
    };
    if (type === "select") {
      if (fieldProps.loadOptions) {
        fieldProps.component = AsyncSelectField;
      } else {
        fieldProps.component = SelectField;
        fieldProps.options = options.map(([value, label]) => ({ value, label }));
      }
    } else if (type === "textarea") {
      fieldProps.component = "textarea";
    } else {
      fieldProps.type = type;
    }
    const isInlineLabel = type === "checkbox";
    return (
      <div className={className}>
        {label && !hidden && !isInlineLabel && <label>{label}</label>}
        {isInlineLabel && label ? (
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
  ${props => !props.noMargin && "margin-bottom: 1rem"};
`;
