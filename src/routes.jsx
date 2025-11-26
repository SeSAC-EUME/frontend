/**
 * Main Router
 * Admin과 User 라우팅 통합
 */
import { createBrowserRouter } from 'react-router-dom';
import adminRoutes from './admin/routes';
import userRoutes from './user/routes';

// Admin과 User 라우트 병합
const router = createBrowserRouter([
  ...userRoutes,
  ...adminRoutes,
]);

export default router;
