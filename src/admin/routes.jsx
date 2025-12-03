/**
 * Admin Routes
 * 관리자 페이지 라우팅
 */
import React from 'react';

// Admin Pages
import AdminLogin from './pages/Login';
import AdminDashboard from './pages/Dashboard';
import AdminUsers from './pages/Users';
import AdminEmotionMonitor from './pages/EmotionMonitor';
import AdminConversation from './pages/Conversation';
import AdminReports from './pages/Reports';
import AdminProfile from './pages/Profile';

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
        path: 'emotion-monitor',
        element: <AdminEmotionMonitor />,
      },
      {
        path: 'conversation',
        element: <AdminConversation />,
      },
      {
        path: 'reports',
        element: <AdminReports />,
      },
      {
        path: 'profile',
        element: <AdminProfile />,
      },
    ],
  },
];

export default adminRoutes;
