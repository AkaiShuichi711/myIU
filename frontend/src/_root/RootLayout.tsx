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
//         <Loader2 className="h-8 w-8 animate-spin text-[#009cd1]" />
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

  const hideShell = location.pathname === "/home";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#009cd1]" />
      </div>
    );
  }

return (
  // Khung cha bao trọn diện tích trống kéo dọc theo khối đứng của App.tsx
  <div className="w-full flex-1 flex min-h-0 overflow-hidden bg-[#F8FAFC]">
    
    {/* Chỉ gọi duy nhất LeftSidebar trên desktop, Topbar bị triệt tiêu hoàn toàn */}
    {!hideShell && <LeftSidebar />}
    
    {/* Vùng không gian hiển thị các nội dung Dashboard */}
    <section className="flex-1 h-full overflow-y-auto bg-[#F8FAFC]">
      <Outlet />
    </section>
  </div>
);

};

export default RootLayout;
