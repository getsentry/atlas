import React from "react";
import { Route, IndexRoute } from "react-router";
// import Loadable from "react-loadable";

import App from "./pages/App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Office from "./pages/Office";
import Offices from "./pages/Offices";
import OrgChart from "./pages/OrgChart";
import People from "./pages/People";
import Profile from "./pages/Profile";
import UpdateOffice from "./pages/UpdateOffice";
import UpdateProfile from "./pages/UpdateProfile";

import NotFoundError from "./components/NotFoundError";
// import PageLoading from "./components/PageLoading";

// const AsyncSettings = Loadable({
//   loader: () => import('./pages/Settings'),
//   loading: PageLoading
// });

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="/login" component={Login} />
    <Route path="/offices" component={Offices} />
    <Route path="/offices/:externalId" component={Office} />
    <Route path="/offices/:externalId/update" component={UpdateOffice} />
    <Route path="/orgChart" component={OrgChart} />
    <Route path="/people" component={People} />
    <Route path="/people/:email" component={Profile} />
    <Route path="/people/:email/update" component={UpdateProfile} />
    <Route path="*" component={NotFoundError} />
  </Route>
);
