/**
 * React Router 라우팅 설정
 * 관리자(Admin) 페이지와 사용자(User) 페이지 분리
 */
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminEmergency from './pages/admin/Emergency';

// User Pages
import UserSplash from './pages/user/Splash';
import UserLogin from './pages/user/Login';
import UserOnboarding1 from './pages/user/Onboarding1';
import UserOnboarding2 from './pages/user/Onboarding2';
import UserOnboarding3 from './pages/user/Onboarding3';
import UserOnboarding4 from './pages/user/Onboarding4';
import UserHome from './pages/user/Home';
import UserChat from './pages/user/Chat';
import UserHealth from './pages/user/Health';
import UserWelfare from './pages/user/Welfare';
import UserEmergency from './pages/user/Emergency';
import UserSettings from './pages/user/Settings';

// Router 설정
const router = createBrowserRouter([
  {
    path: '/',
    element: <UserSplash />,
  },
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <AdminLogin />,
      },
      {
        path: 'login',
        element: <AdminLogin />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'emergency',
        element: <AdminEmergency />,
      },
    ],
  },
  {
    path: '/user',
    children: [
      {
        path: 'splash',
        element: <UserSplash />,
      },
      {
        path: 'login',
        element: <UserLogin />,
      },
      {
        path: 'onboarding-1',
        element: <UserOnboarding1 />,
      },
      {
        path: 'onboarding-2',
        element: <UserOnboarding2 />,
      },
      {
        path: 'onboarding-3',
        element: <UserOnboarding3 />,
      },
      {
        path: 'onboarding-4',
        element: <UserOnboarding4 />,
      },
      {
        path: 'home',
        element: <UserHome />,
      },
      {
        path: 'chat',
        element: <UserChat />,
      },
      {
        path: 'health',
        element: <UserHealth />,
      },
      {
        path: 'welfare',
        element: <UserWelfare />,
      },
      {
        path: 'emergency',
        element: <UserEmergency />,
      },
      {
        path: 'settings',
        element: <UserSettings />,
      },
    ],
  },
]);

export default router;
