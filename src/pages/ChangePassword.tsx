import { Formik } from 'formik';
import { toast } from 'react-hot-toast';
import Api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useNavigate } from 'react-router-dom';

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePassword() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Change password"
        subtitle="Update the password for your signed-in account"
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Formik<FormValues>
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validate={(values) => {
            const errors: Partial<Record<keyof FormValues, string>> = {};
            if (!values.currentPassword) errors.currentPassword = 'Required';
            if (!values.newPassword) errors.newPassword = 'Required';
            else if (values.newPassword.length < 4) {
              errors.newPassword = 'At least 4 characters';
            }
            if (values.newPassword !== values.confirmPassword) {
              errors.confirmPassword = 'Passwords do not match';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const res = await Api.post('api/auth/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              });
              toast.success(res.data.message ?? 'Password changed');
              resetForm();
              navigate('/');
            } catch (err: unknown) {
              const msg =
                (err as { response?: { data?: { message?: string } } })?.response
                  ?.data?.message ?? 'Failed to change password';
              toast.error(msg);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                label="Current password"
                value={formik.values.currentPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="current-password"
              />
              {formik.touched.currentPassword && formik.errors.currentPassword && (
                <p className="text-xs text-red-600">{formik.errors.currentPassword}</p>
              )}

              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="New password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="new-password"
              />
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="text-xs text-red-600">{formik.errors.newPassword}</p>
              )}

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm new password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="new-password"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-xs text-red-600">{formik.errors.confirmPassword}</p>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={formik.isSubmitting} className="flex-1">
                  {formik.isSubmitting ? 'Saving…' : 'Update password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={formik.isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
