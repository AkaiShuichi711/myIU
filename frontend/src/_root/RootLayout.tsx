import { Outlet } from "react-router-dom";

import { useUserContext } from "@/context/AuthContext";
import { LeftSidebar, Topbar } from "@/components/shared";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RootLayout = () => {
  const { isAuthenticated } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>
    </div>
  );
};

export default RootLayout;