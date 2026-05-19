import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Fingerprint, Home, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 ring-1 ring-indigo-200">
          <Fingerprint className="h-8 w-8 text-indigo-600" />
        </div>
        <p className="mt-8 text-7xl font-bold tracking-tight text-indigo-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isAuthenticated ? (
            <Button asChild className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go to dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild className="gap-2">
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Go to login
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={isAuthenticated ? '/student' : '/login'}>
              {isAuthenticated ? 'Students' : 'Sign in'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
