import React from "react";

export default ({
  office: { location, postalCode, regionCode, locality, administrativeArea }
}) => {
  return (
    <React.Fragment>
      <div>{location || ""}</div>
      <div>
        {locality ? `${locality}, ` : ""}
        {administrativeArea || ""}
        {postalCode ? ` ${postalCode}, ` : ""}
        {regionCode}
      </div>
    </React.Fragment>
  );
};
