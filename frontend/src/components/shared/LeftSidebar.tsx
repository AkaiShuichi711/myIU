import { Link, useLocation } from "react-router-dom";
import { Home, Compass, User, Network, Bookmark, Users } from "lucide-react"; // Icon công nghệ đồng bộ

const LeftSidebar = () => {
  const { pathname } = useLocation();

  // Mảng quản lý danh sách menu để dễ bảo trì và thêm bớt trang
  const sidebarLinks = [
    { label: "Home", route: "/home", icon: Home },
    { label: "Profile", route: "/profile", icon: User },
    { label: "Tenant Data", route: "/tenant", icon: Network },
    { label: "Saved", route: "/saved", icon: Bookmark },
    { label: "All Users", route: "/all-users", icon: Users },
    { label: "Explore", route: "/explore", icon: Compass },
  ];

  return (
    // Đã nâng cấp lên border-r-2 border-slate-200 đồng bộ hoàn hảo với độ dày của Card Header
    <aside className="w-full max-w-[260px] border-r-2 border-slate-200/80 bg-white p-4 hidden md:block shrink-0 h-full">
      <nav className="flex flex-col gap-1.5 mt-2">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          // Tự động kiểm tra xem trang nào đang được mở để kích hoạt màu thương hiệu
          const isActive = pathname === link.route || (link.route === "/home" && pathname === "/");

          return (
            <Link
              key={link.label}
              to={link.route}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
                isActive
                  ? "bg-[#ffffff] text-[#009cd1] border border-[#009cd1]" // Khi Active: Chữ xanh đậm thương hiệu, nền mờ
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900" // Khi Hover: Sáng nhẹ tinh tế
              }`}
            >
              {/* Icon tự động đổi màu mượt mà theo chữ khi hover hoặc active */}
              <Icon 
                className={`h-5 w-5 transition-colors ${
                  isActive ? "text-[#009cd1]" : "text-slate-400 group-hover:text-slate-600"
                }`} 
              />
              
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default LeftSidebar;
