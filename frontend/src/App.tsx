import { Routes, Route, Navigate } from 'react-router-dom';
import './globals.css';
import AuthLayout from './_auth/AuthLayout';
import AuthCallback from './_auth/AuthCallback';
import RootLayout from './_root/RootLayout';
import SignInForm from './_auth/forms/SignInForm';
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
  SupportPage,
  TimetablePage,
} from './_root/pages';
import TenantPage from './_root/pages/Tenant';
import NotFoundPage from './_root/pages/NotFoundPage';

const App = () => {
  return (
    <main className="w-full h-screen overflow-hidden bg-white flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignInForm />} />
          <Route path="/sign-up" element={<Navigate to="/sign-in" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/*" element={<Navigate to="/sign-in" replace />} />
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
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/create" element={<CreateCoursePage />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/forms/review/:id" element={<FormReviewPage />} />
          <Route path="/support" element={<SupportPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </main>
  );
};

export default App;
