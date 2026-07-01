import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { setToken, setAuthProvider } from '@/lib/api/client';
import { useUserContext } from '@/context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { checkAuthUser } = useUserContext();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      setToken(token);
      setAuthProvider('microsoft');
      // checkAuthUser cập nhật isAuthenticated trong context trước khi navigate
      // tránh RootLayout thấy isAuthenticated=false rồi kick về /sign-in
      checkAuthUser().then((ok) => {
        navigate(ok ? '/' : '/sign-in?error=oauth2', { replace: true });
      });
    } else {
      navigate('/sign-in', { replace: true });
    }
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-[#323393]" />
    </div>
  );
};

export default AuthCallback;
