/**
 * User Routes
 * 사용자 페이지 라우팅
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

// User Pages
import UserSplash from './pages/Splash';
import UserLogin from './pages/Login';
import OAuth2Redirect from './pages/OAuth2Redirect';
import UserOnboarding1 from './pages/Onboarding1';
import UserOnboarding2 from './pages/Onboarding2';
import UserOnboarding3 from './pages/Onboarding3';
import UserOnboarding4 from './pages/Onboarding4';
import UserHome from './pages/Home';
import UserSettings from './pages/Settings';

const userRoutes = [
  {
    path: '/',
    element: <Navigate to="/user/splash" replace />,
  },
  {
    path: '/oauth2/redirect',
    element: <OAuth2Redirect />,
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
        path: 'settings',
        element: <UserSettings />,
      },
    ],
  },
];

export default userRoutes;
