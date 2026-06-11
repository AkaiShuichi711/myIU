import { Routes, Route, Navigate } from 'react-router-dom';
import './globals.css';
import { useEffect } from 'react';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import SignInForm from './_auth/forms/SignInForm';
import SignUpForm from './_auth/forms/SignUpForm';
import ForgotPassword from './_auth/forms/ForgotPassword';
import { Toaster } from './components/ui/toaster';
import {
  Home,
  Profile,
  UpdateProfile,
  Settings,
  Notifications,
  CoursesPage,
  CourseDetail,
  CreateCoursePage,
  FormsPage,
  FormReviewPage,
} from './_root/pages';
import TenantPage from './_root/pages/Tenant';

const App = () => {
  useEffect(() => {
    console.log('App mounted');
  }, []);

  return (
    // ĐÃ SỬA: Xóa bỏ "flex", dùng w-full h-screen overflow-hidden để layout con bên trong tự quyết định trục tọa độ
    <main className="w-full h-screen overflow-hidden bg-white flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignInForm />} />
          <Route path="/sign-up" element={<SignUpForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Private Routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Navigate to="/courses" replace />} />
          <Route path="/saved" element={<Navigate to="/courses" replace />} />
          <Route path="/all-users" element={<Navigate to="/courses" replace />} />
          <Route path="/create-post" element={<Navigate to="/courses" replace />} />
          <Route path="/update-post/:id" element={<Navigate to="/courses" replace />} />
          <Route path="/posts/:id" element={<Navigate to="/courses" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/tenant" element={<TenantPage />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/create" element={<CreateCoursePage />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/forms/review/:id" element={<FormReviewPage />} />
        </Route>
      </Routes>
      <Toaster />
    </main>
  );
};

export default App;
