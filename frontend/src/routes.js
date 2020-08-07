import React from "react";
import { Route, IndexRoute } from "react-router";
// import Loadable from "react-loadable";

import App from "./pages/App";
import AdminLayout from "./pages/AdminLayout";
import AdminAudit from "./pages/AdminAudit";
import AdminChanges from "./pages/AdminChanges";
import AdminChangeDetails from "./pages/AdminChangeDetails";
import AdminCreateDepartment from "./pages/AdminCreateDepartment";
import AdminDepartments from "./pages/AdminDepartments";
import AdminDeleteDepartment from "./pages/AdminDeleteDepartment";
import AdminDeleteTeam from "./pages/AdminDeleteTeam";
import AdminImportExportPeople from "./pages/AdminImportExportPeople";
import AdminTeams from "./pages/AdminTeams";
import AdminUpdateDepartment from "./pages/AdminUpdateDepartment";
import AdminUpdateTeam from "./pages/AdminUpdateTeam";
import HealthCheck from "./pages/HealthCheck";
import Home from "./pages/Home";
import Flashcards from "./pages/Flashcards";
import Login from "./pages/Login";
import Office from "./pages/Office";
import Offices from "./pages/Offices";
import Onboarding from "./pages/Onboarding";
import OrgChart from "./pages/OrgChart";
import OrgChartInteractive from "./pages/OrgChartInteractive";
import People from "./pages/People";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
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
    <Route path="/flashcards" component={Flashcards} />
    <Route path="/login" component={Login} />
    <Route path="/offices" component={Offices} />
    <Route path="/offices/:externalId" component={Office} />
    <Route path="/offices/:externalId/update" component={UpdateOffice} />
    <Route path="/onboarding" component={Onboarding} />
    <Route path="/orgChart" component={OrgChart} />
    <Route path="/orgChartInteractive" component={OrgChartInteractive} />
    <Route path="/people" component={People} />
    <Route path="/people/:email" component={Profile} />
    <Route path="/people/:email/update" component={UpdateProfile} />
    <Route path="/quiz" component={Quiz} />
    <Route path="/admin" component={AdminLayout}>
      <Route path="/admin/changes" component={AdminChanges} />
      <Route path="/admin/changes/:changeId" component={AdminChangeDetails} />
      <Route path="/admin/departments" component={AdminDepartments} />
      <Route path="/admin/departments/create" component={AdminCreateDepartment} />
      <Route path="/admin/departments/:departmentId" component={AdminUpdateDepartment} />
      <Route
        path="/admin/departments/:departmentId/delete"
        component={AdminDeleteDepartment}
      />
      <Route path="/admin/teams" component={AdminTeams} />
      <Route path="/admin/teams/:teamId" component={AdminUpdateTeam} />
      <Route path="/admin/teams/:teamId/delete" component={AdminDeleteTeam} />
      <Route path="/admin/people/audit" component={AdminAudit} />
      <Route path="/admin/people/import-export" component={AdminImportExportPeople} />
    </Route>
    <Route path="*" component={NotFoundError} />
  </Route>
);
