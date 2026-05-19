import { useEffect, useState } from 'react';
import Api from '@/lib/api';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/Loader';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import Modal from '@/components/ui/Modal';
import { Formik } from 'formik';
import Badge, { enums } from '@/components/ui/Badge';
import type { UserRole } from '@/types/auth';
import { Plus } from 'lucide-react';

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  maxBatches: number | null;
  maxStudentsPerBatch: number | null;
  _count: { batches: number };
};

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'Admin' as UserRole,
  maxBatches: 5,
  maxStudentsPerBatch: 45,
};

export default function Users() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    editId: string;
    data: typeof emptyForm;
  }>({ open: false, editId: '', data: emptyForm });

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await Api.get('api/user');
      setUsers(res.data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader
        title="User management"
        subtitle="Create MasterAdmins and Admins with configurable limits"
        action={
          <Button
            onClick={() =>
              setModal({ open: true, editId: '', data: { ...emptyForm } })
            }
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['Name', 'ID', 'Role', 'Batch limit', 'Students/batch', 'Batches', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No users yet. Create your first Admin or MasterAdmin.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === 'MasterAdmin'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {u.role === 'Admin' ? u.maxBatches : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {u.role === 'Admin' ? u.maxStudentsPerBatch : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{u._count.batches}</td>
                  <td className="px-6 py-4">
                    <span className="flex gap-2">
                      {u.role === 'Admin' && (
                        <Badge
                          type={enums.GREEN}
                          onClick={() =>
                            setModal({
                              open: true,
                              editId: u.id,
                              data: {
                                name: u.name,
                                email: u.email,
                                password: '',
                                role: u.role,
                                maxBatches: u.maxBatches ?? 5,
                                maxStudentsPerBatch: u.maxStudentsPerBatch ?? 45,
                              },
                            })
                          }
                        >
                          Edit
                        </Badge>
                      )}
                      <Badge
                        type={enums.RED}
                        onClick={async () => {
                          if (!window.confirm('Delete this user?')) return;
                          try {
                            const res = await Api.delete(`api/user/${u.id}`);
                            toast.success(res.data.message);
                            fetchUsers();
                          } catch (err: unknown) {
                            const e = err as { response?: { data?: { message?: string } } };
                            toast.error(e.response?.data?.message ?? 'Delete failed');
                          }
                        }}
                      >
                        Delete
                      </Badge>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={modal.editId ? 'Edit admin limits' : 'Create user'}
        open={modal.open}
        setOpen={() => setModal({ open: false, editId: '', data: emptyForm })}
      >
        <Formik
          enableReinitialize
          initialValues={modal.data}
          onSubmit={async (values, action) => {
            try {
              if (modal.editId) {
                const payload: Record<string, unknown> = {
                  name: values.name,
                  email: values.email,
                  maxBatches: Number(values.maxBatches),
                  maxStudentsPerBatch: Number(values.maxStudentsPerBatch),
                };
                if (values.password) payload.password = values.password;
                const res = await Api.patch(`api/user/${modal.editId}`, payload);
                toast.success(res.data.message);
              } else {
                const res = await Api.post('api/user', {
                  ...values,
                  maxBatches: Number(values.maxBatches),
                  maxStudentsPerBatch: Number(values.maxStudentsPerBatch),
                });
                toast.success(res.data.message);
              }
              setModal({ open: false, editId: '', data: emptyForm });
              fetchUsers();
            } catch (err: unknown) {
              const e = err as { response?: { data?: { message?: string } } };
              toast.error(e.response?.data?.message ?? 'Save failed');
            } finally {
              action.setSubmitting(false);
            }
          }}
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit} className="space-y-4 px-4 pb-6 pt-2">
              <Input name="name" label="Name" value={formik.values.name} onChange={formik.handleChange} />
              <Input name="email" label="Account ID" value={formik.values.email} onChange={formik.handleChange} />
              {!modal.editId && (
                <>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Role</label>
                    <select
                      name="role"
                      value={formik.values.role}
                      onChange={formik.handleChange}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="Admin">Admin</option>
                      <option value="MasterAdmin">MasterAdmin</option>
                    </select>
                  </div>
                  <PasswordInput
                    name="password"
                    label="Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    showGenerate
                    required
                  />
                </>
              )}
              {formik.values.role === 'Admin' && (
                <>
                  <Input
                    name="maxBatches"
                    label="Max batches"
                    type="number"
                    value={String(formik.values.maxBatches)}
                    onChange={formik.handleChange}
                  />
                  <Input
                    name="maxStudentsPerBatch"
                    label="Max students per batch"
                    type="number"
                    value={String(formik.values.maxStudentsPerBatch)}
                    onChange={formik.handleChange}
                  />
                </>
              )}
              {modal.editId && (
                <PasswordInput
                  name="password"
                  label="New password (optional)"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Leave blank to keep current"
                />
              )}
              <Button type="submit" disabled={formik.isSubmitting} className="w-full">
                {modal.editId ? 'Update' : 'Create'}
              </Button>
            </form>
          )}
        </Formik>
      </Modal>
    </div>
  );
}
