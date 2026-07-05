import { Outlet } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { LeftSidebar, Topbar } from "@/components/shared";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

const RootLayout = () => {
  const { isAuthenticated, isLoading, user } = useUserContext();
  const navigate = useNavigate();
  useNotificationSocket(user?.id ?? '');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-[#009CD1]" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#F8FAFC] dark:bg-[#19191a] transition-colors duration-200">
      <Topbar />

      <div className="w-full flex-1 flex min-h-0 overflow-hidden">
        <LeftSidebar />

        <section className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#19191a] transition-colors duration-200">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default RootLayout;
