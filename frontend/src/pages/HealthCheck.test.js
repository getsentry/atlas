import React from "react";
import ReactDOM from "react-dom";
import HealthCheck from "./HealthCheck";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<HealthCheck />, div);
  ReactDOM.unmountComponentAtNode(div);
});
