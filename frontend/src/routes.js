import React from "react";
import { Route, IndexRoute } from "react-router";
// import Loadable from "react-loadable";

import App from "./pages/App";
import AdminLayout from "./pages/AdminLayout";
import AdminAudit from "./pages/AdminAudit";
import AdminDepartments from "./pages/AdminDepartments";
import AdminBulkUpdatePeople from "./pages/AdminBulkUpdatePeople";
import HealthCheck from "./pages/HealthCheck";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Office from "./pages/Office";
import Offices from "./pages/Offices";
import Onboarding from "./pages/Onboarding";
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
    <Route path="/healthz" component={HealthCheck} />
    <Route path="/login" component={Login} />
    <Route path="/offices" component={Offices} />
    <Route path="/offices/:externalId" component={Office} />
    <Route path="/offices/:externalId/update" component={UpdateOffice} />
    <Route path="/onboarding" component={Onboarding} />
    <Route path="/orgChart" component={OrgChart} />
    <Route path="/people" component={People} />
    <Route path="/people/:email" component={Profile} />
    <Route path="/people/:email/update" component={UpdateProfile} />
    <Route path="/admin" component={AdminLayout}>
      <Route path="/admin/audit" component={AdminAudit} />
      <Route path="/admin/departments" component={AdminDepartments} />
      <Route path="/admin/update-people" component={AdminBulkUpdatePeople} />
    </Route>
    <Route path="*" component={NotFoundError} />
  </Route>
);
