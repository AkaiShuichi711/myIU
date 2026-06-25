import { useAdminAuth } from '@/context/AdminAuthContext';
import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Users', value: '—', icon: Users, color: 'bg-blue-50 text-blue-600' },
  { label: 'Courses', value: '—', icon: BookOpen, color: 'bg-green-50 text-green-600' },
  { label: 'Forms', value: '—', icon: FileText, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Active Today', value: '—', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
];

const AdminDashboard = () => {
  const { admin } = useAdminAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Welcome back, {admin?.name}</h2>
        <p className="text-sm text-gray-500 mt-1">Here's an overview of the myIU platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-600">
          <a href="/admin/users" className="flex items-center gap-2 p-3 rounded-md border border-gray-200 hover:border-[#1e51f9] hover:text-[#1e51f9] transition-colors">
            <Users className="h-4 w-4" /> Manage Users
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
