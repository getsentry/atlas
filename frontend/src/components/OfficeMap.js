import React, { Component } from "react";

import Map from "./Map";

export default class OfficeMap extends Component {
  render() {
    const { office } = this.props;
    if (!office || !office.lat || !office.lng) return null;
    return (
      <Map
        options={{
          center: { lat: +office.lat, lng: +office.lng },
          zoom: this.props.zoom || 8,
          disableDefaultUI: this.props.withUI ? false : true
        }}
        onMapLoad={map => {
          new window.google.maps.Marker({
            map: map,
            position: { lat: +office.lat, lng: +office.lng },
            title: office.name
          });
        }}
        {...this.props}
      />
    );
  }
}
