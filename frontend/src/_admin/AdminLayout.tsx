import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { LayoutDashboard, Users, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users, exact: false },
];

const AdminLayout = () => {
  const { isAuthenticated, isLoading, admin, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F4F6FA]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e51f9]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSignOut = () => {
    signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#F4F6FA] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-[#0A1128] text-white flex flex-col transition-all duration-200 shrink-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <span className="text-sm font-semibold tracking-wide">Admin Portal</span>
          )}
          <button onClick={() => setSidebarOpen(p => !p)} className="text-white/70 hover:text-white ml-auto">
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {navItems.map(item => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && location.pathname !== '/admin';
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          {sidebarOpen && (
            <p className="text-xs text-white/50 truncate mb-2">{admin?.email}</p>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/60 hover:bg-white/10 hover:text-white w-full transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-base font-semibold text-gray-800">
            {navItems.find(n =>
              n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to)
            )?.label ?? 'Admin'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="bg-[#1e51f9]/10 text-[#1e51f9] px-2 py-0.5 rounded text-xs font-medium">
              {admin?.role}
            </span>
            <span>{admin?.name}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
