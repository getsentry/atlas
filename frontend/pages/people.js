import Layout from "../components/Layout";
import PeopleList from "../components/PeopleList";

export default () => (
  <Layout>
    <h1>People</h1>
    <a href="/orgChart">View Org Chart</a>
    <PeopleList />
  </Layout>
);
