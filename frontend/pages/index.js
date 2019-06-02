import { connect } from "react-redux";
import initialize from "../utils/initialize";
import Layout from "../components/Layout";

const Index = () => (
  <Layout title="Home">
    <h1>Welcome to Atlas</h1>
    <p>Atlas is your map to Sentry.</p>
    <p>
      We could probably put the newest hires here? Anniversaries? Birthdays?
    </p>
  </Layout>
);

Index.getInitialProps = function(ctx) {
  initialize(ctx);
};

export default connect(state => state)(Index);
