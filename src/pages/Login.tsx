import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Fingerprint, Shield } from 'lucide-react';
import type { AuthSession } from '@/types/auth';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen gradient-login flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <Fingerprint className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xl font-bold">BioScan</p>
            <p className="text-sm text-indigo-200">Fingerprint management</p>
          </div>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Secure biometric administration for your organization
          </h1>
          <p className="text-lg text-indigo-100/90">
            Manage admins, batches, and student fingerprints with role-based
            access and Mantra MFS100 scanner integration.
          </p>
          <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
            <Shield className="h-5 w-5 text-indigo-200" />
            <p className="text-sm text-indigo-100">
              MasterAdmin and Admin roles with configurable limits
            </p>
          </div>
        </div>

        <p className="text-xs text-indigo-300/80">
          Install scanner drivers before capturing fingerprints
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="glass-card w-full max-w-md p-8 sm:p-10">
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Fingerprint className="h-5 w-5" />
            </div>
            <p className="text-lg font-bold text-slate-900">BioScan</p>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">
            Sign in with your account ID and password
          </p>

          <Formik
            initialValues={{ email: '', password: '' }}
            onSubmit={async (values, action) => {
              try {
                const res = await axios.post(
                  `${import.meta.env.VITE_BASE_URL}/api/auth/admin`,
                  values,
                );
                const session = res.data.data as AuthSession;
                login(session);
                toast.success(res.data.message);
                navigate('/');
              } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } } };
                toast.error(err.response?.data?.message ?? 'Login failed');
              } finally {
                action.setSubmitting(false);
              }
            }}
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Account ID
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    placeholder="Enter your ID"
                    value={formik.values.email}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    className="h-11"
                  />
                </div>

                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  autoComplete="current-password"
                />

                <Button
                  disabled={formik.isSubmitting}
                  className="h-11 w-full bg-indigo-600 text-base font-semibold hover:bg-indigo-700"
                  type="submit"
                >
                  {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
