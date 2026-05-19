import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import type { UserRole } from './types/auth';

const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Batch = lazy(() => import('@/pages/Batch'));
const Students = lazy(() => import('@/pages/students/Students'));
const AddStudent = lazy(() => import('@/pages/students/AddStudent'));
const ViewStudent = lazy(() => import('@/pages/students/ViewStudent'));
const Users = lazy(() => import('@/pages/users/Users'));

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function RoleRoutes({ roles }: { roles: UserRole[] }) {
  const { hasRole, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!roles.some((r) => hasRole(r))) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const routes = createBrowserRouter([
    { path: '/login', element: <Login /> },
    {
      element: <ProtectedRoutes />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: '/', element: <Home /> },
            {
              element: <RoleRoutes roles={['MasterAdmin']} />,
              children: [{ path: '/users', element: <Users /> }],
            },
            {
              element: <RoleRoutes roles={['User', 'MasterAdmin']} />,
              children: [
                { path: '/batch', element: <Batch /> },
                { path: '/student', element: <Students /> },
                { path: '/student/:event', element: <AddStudent /> },
                { path: '/view-student/:id', element: <ViewStudent /> },
              ],
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={routes} />;
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
