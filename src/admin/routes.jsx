/**
 * Admin Routes
 * 관리자 페이지 라우팅
 */
import React from 'react';

// Admin Pages
import AdminLogin from './pages/Login';
import AdminDashboard from './pages/Dashboard';
import AdminUsers from './pages/Users';
import AdminEmergency from './pages/Emergency';

const adminRoutes = [
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
];

export default adminRoutes;
