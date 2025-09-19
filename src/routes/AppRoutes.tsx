import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Admin */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        {/* User */}
        <Route path="/user/*" element={<UserRoutes />} />
        {/* Public */}
        <Route path="/*" element={<PublicRoutes />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
