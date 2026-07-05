import { Routes, Route, Navigate } from 'react-router-dom';
import './globals.css';
import AuthLayout from './_auth/AuthLayout';
import AuthCallback from './_auth/AuthCallback';
import RootLayout from './_root/RootLayout';
import SignInForm from './_auth/forms/SignInForm';
import ForgotPassword from './_auth/forms/ForgotPassword';
import AdminLoginPage from './_admin/AdminLoginPage';
import AdminLayout from './_admin/AdminLayout';
import AdminDashboard from './_admin/AdminDashboard';
import AdminUsersPage from './_admin/AdminUsersPage';
import AdminProvisionPage from './_admin/AdminProvisionPage';
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
  SupportPage,
  TimetablePage,
} from './_root/pages';
import TenantPage from './_root/pages/Tenant';

const App = () => {
  return (
    // ĐÃ SỬA: Xóa bỏ "flex", dùng w-full h-screen overflow-hidden để layout con bên trong tự quyết định trục tọa độ
    <main className="w-full h-screen overflow-hidden bg-white flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignInForm />} />
          {/* /sign-up is not supported — app uses Microsoft SSO only */}
          <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* OAuth2 callback — nhận token từ Spring Boot sau Microsoft SSO */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Redirect other /auth/* paths */}
          <Route path="/auth/*" element={<Navigate to="/sign-in" replace />} />
        </Route>

        {/* Private Routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          {/* Legacy social feed routes - redirected */}
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
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/create" element={<CreateCoursePage />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/forms/review/:id" element={<FormReviewPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="provision" element={<AdminProvisionPage />} />
        </Route>

        {/* Catch-all: redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </main>
  );
};

export default App;
