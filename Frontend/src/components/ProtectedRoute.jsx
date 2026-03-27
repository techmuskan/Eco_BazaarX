import { Navigate } from "react-router-dom";
import { getDashboardPathForRole, hasAnyRole } from "../utils/roleAccess";

const ProtectedRoute = ({ children, user, allowedRoles = [] }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !hasAnyRole(user.role, allowedRoles)) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
