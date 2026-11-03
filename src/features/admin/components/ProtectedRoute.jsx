import { Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../auth";
import PropTypes from "prop-types";
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }
  return children;
}
ProtectedRoute.propTypes = {
  children: PropTypes.node,
};
export default ProtectedRoute;
