import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  authProvider: string;
  roles: string[];
  createdAt: string;
}

const AdminUsersPage = () => {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to fetch users'))
      .then((data: User[]) => setUsers(data))
      .catch(() => setError('Could not load users'))
      .finally(() => setIsLoading(false));
  }, [token]);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No users found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Provider</th>
                <th className="text-left px-4 py-3">Roles</th>
                <th className="text-left px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{user.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      user.authProvider === 'microsoft' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.authProvider || 'local'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.roles?.join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
