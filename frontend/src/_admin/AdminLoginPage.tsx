import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail } from 'lucide-react';
import Loader from '@/components/shared/Loader';

const AdminLoginPage = () => {
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password'); return; }
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg px-8 py-8 w-[409px]">
        <div className="flex justify-center mb-6">
          <img src="/assets/images/logo_beforesignin.svg" alt="myIU" />
        </div>

        <p className="text-center text-[#000000] font-bold text-lg mb-1">Admin Portal</p>
        <p className="text-center text-gray-500 text-sm mb-6">Sign in with your admin account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-10 bg-white border border-gray-500 hover:border-[#2F88FF] pr-10"
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-10 bg-white border border-gray-500 hover:border-[#2F88FF] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            className="bg-[#0A1128] hover:bg-[#111827] text-white h-10 flex items-center justify-center gap-2 shadow-lg mt-2"
            disabled={isLoading}
          >
            {isLoading ? <><Loader /> Signing in…</> : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Issues? Contact</p>
          <a href="mailto:support@pas.vn" className="text-[#F15A22] hover:underline">support@pas.vn</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
