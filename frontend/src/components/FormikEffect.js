// https://github.com/jaredpalmer/formik-effect/issues/4
import PropTypes from "prop-types";

import { Component } from "react";
import { debounce, isEqual } from "lodash";
import { connect } from "formik";

const SAVE_DELAY = 200;

class FormikEffects extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    formik: PropTypes.object,
  };

  onChange = debounce(this.props.onChange, SAVE_DELAY);

  componentDidUpdate(prevProps) {
    const { formik } = this.props;
    const { isValid } = formik;

    const hasChanged = !isEqual(prevProps.formik.values, formik.values);
    const shouldCallback = isValid && hasChanged;

    if (shouldCallback) {
      this.onChange(prevProps.formik.values, formik.values);
    }
  }

  render() {
    return null;
  }
}

export default connect(FormikEffects);
