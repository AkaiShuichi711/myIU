import { Routes, Route } from 'react-router-dom';
import './globals.css';
import { useEffect } from 'react';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import SignInForm from './_auth/forms/SignInForm';
import SignUpForm from './_auth/forms/SignUpForm';
import ForgotPassword from './_auth/forms/ForgotPassword';
import { Toaster } from './components/ui/toaster';
import {
  AllUsers,
  CreatePost,
  EditPost,
  Explore,
  Home,
  PostDetails,
  Profile,
  Saved,
  UpdateProfile,
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
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path='/posts/:id' element= {<PostDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/tenant" element={<TenantPage />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
        </Route>
      </Routes>
      <Toaster />
    </main>
  );
};

export default App;
