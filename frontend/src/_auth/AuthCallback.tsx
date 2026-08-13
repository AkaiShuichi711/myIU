import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { setToken, setAuthProvider } from '@/lib/api/client';
import { useUserContext } from '@/context/AuthContext';
import { requestAndReportGeoLocation } from '@/hooks/geoLocation';

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
        if (ok) {
          // Fire-and-forget: xin quyền vị trí browser để định vị chính xác hơn
          // tới quận/phường. Không await — không được chặn navigate.
          requestAndReportGeoLocation();
        }
        navigate(ok ? '/' : '/sign-in?error=oauth2', { replace: true });
      });
    } else {
      navigate('/sign-in', { replace: true });
    }
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="h-8 w-8 animate-spin text-[#0057A8]" />
    </div>
  );
};

export default AuthCallback;
