import React, { Component } from "react";
import PropTypes from "prop-types";

import config from "../config";

export default class Map extends Component {
  static propTypes = {
    width: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOf([PropTypes.number, PropTypes.string])
  };

  static defaultProps = {
    width: 500,
    height: 500
  };

  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  onScriptLoad = () => {
    const map = new window.google.maps.Map(this.mapRef.current, this.props.options);
    this.props.onMapLoad(map);
  };

  componentDidMount() {
    if (!window.google) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.src = `https://maps.google.com/maps/api/js?key=${config.googleMapsKey}`;
      var x = document.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
      // Below is important.
      //We cannot access google.maps until it's finished loading
      s.addEventListener("load", () => {
        this.onScriptLoad();
      });
    } else {
      this.onScriptLoad();
    }
  }

  render() {
    return (
      <div
        className="block"
        style={{ width: this.props.width, height: this.props.height }}
        ref={this.mapRef}
      />
    );
  }
}
