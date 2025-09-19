import { Outlet } from "react-router-dom";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import FooterUser from "../components/dashboard/FooterUser";

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      <FooterUser/>
    </div>
  );
};

export default UserLayout;
