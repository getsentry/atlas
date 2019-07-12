import { connect } from "react-redux";

function SuperuserOnly({ children, user }) {
  if (!user || !user.isSuperuser) return null;
  return children;
}

export default connect(({ auth }) => ({
  user: auth.user
}))(SuperuserOnly);
