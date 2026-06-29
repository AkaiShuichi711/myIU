import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { setToken, setAuthProvider } from '@/lib/api/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      setToken(token);
      setAuthProvider('microsoft');
      navigate('/', { replace: true });
    } else {
      navigate('/sign-in', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-[#F15A22]" />
    </div>
  );
};

export default AuthCallback;
