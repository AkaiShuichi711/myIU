// import { Outlet, useLocation } from "react-router-dom";
// import { useUserContext } from "@/context/AuthContext";
// import { LeftSidebar, Topbar } from "@/components/shared";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Loader2 } from "lucide-react"; // Thêm loader cho sang xịn mịn

// const RootLayout = () => {
//   const { isAuthenticated, isLoading } = useUserContext();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const hideShell = location.pathname === "/home";

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       navigate("/sign-in");
//     }
//   }, [isAuthenticated, isLoading, navigate]);

//   // Thêm đoạn này để chống giật màn hình khi đang kiểm tra đăng nhập
//   if (isLoading) {
//     return (
//       <div className="h-screen w-full flex items-center justify-center bg-slate-50">
//         <Loader2 className="h-8 w-8 animate-spin text-[#F15A22]" />
//       </div>
//     );
//   }

//   return (
//     // Ép class flex-col chạy mượt mà cho toàn trang
//     <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
//       {!hideShell && <Topbar />}
      
//       {/* Thêm w-full h-full flex-1 vào div bọc trục ngang */}
//       <div className={`w-full flex-1 flex ${hideShell ? "h-full" : "flex-col md:flex-row min-h-0"}`}>
//         {!hideShell && <LeftSidebar />}
        
//         {/* Ép section kéo giãn hết cỡ khi ẩn Shell */}
//         <section className={`flex flex-1 ${hideShell ? "w-full h-full" : "h-full overflow-y-auto"}`}>
//           <Outlet />
//         </section>
//       </div>
//     </div>
//   );
// };

// export default RootLayout;


import { Outlet, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { LeftSidebar, Topbar } from "@/components/shared";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-[#F15A22]" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#F8FAFC] dark:bg-[#19191a] transition-colors duration-200">
      {/* Topbar */}
      <Topbar />

      {/* Main content area */}
      <div className="w-full flex-1 flex min-h-0 overflow-hidden">
        <LeftSidebar />

        {/* Content area */}
        <section className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] dark:bg-[#19191a] transition-colors duration-200">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default RootLayout;
