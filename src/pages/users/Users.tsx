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
import { useIsMobile } from '@/hooks/useMediaQuery';

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

function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: ManagedUser;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{user.name}</p>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            user.role === 'MasterAdmin'
              ? 'bg-violet-100 text-violet-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {user.role}
        </span>
      </div>
      {user.role === 'Admin' && (
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center text-xs">
          <div>
            <dt className="text-slate-400">Batches</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{user.maxBatches}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Students</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{user.maxStudentsPerBatch}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Created</dt>
            <dd className="mt-0.5 font-semibold text-slate-800">{user._count.batches}</dd>
          </div>
        </dl>
      )}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {user.role === 'Admin' && (
          <Badge type={enums.GREEN} onClick={onEdit}>
            Edit
          </Badge>
        )}
        <Badge type={enums.RED} onClick={onDelete}>
          Delete
        </Badge>
      </div>
    </article>
  );
}

export default function Users() {
  const isMobile = useIsMobile();
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

  const openEdit = (u: ManagedUser) =>
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
    });

  const deleteUser = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const res = await Api.delete(`api/user/${id}`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Delete failed');
    }
  };

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
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        }
      />

      {isMobile ? (
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
              No users yet. Create your first user.
            </p>
          ) : (
            users.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                onEdit={() => openEdit(u)}
                onDelete={() => deleteUser(u.id)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {['Name', 'ID', 'Role', 'Batch limit', 'Students/batch', 'Batches', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 lg:px-6"
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
                    <td className="px-4 py-4 font-medium text-slate-900 lg:px-6">{u.name}</td>
                    <td className="px-4 py-4 text-slate-600 lg:px-6">{u.email}</td>
                    <td className="px-4 py-4 lg:px-6">
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
                    <td className="px-4 py-4 text-slate-600 lg:px-6">
                      {u.role === 'Admin' ? u.maxBatches : '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 lg:px-6">
                      {u.role === 'Admin' ? u.maxStudentsPerBatch : '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 lg:px-6">{u._count.batches}</td>
                    <td className="px-4 py-4 lg:px-6">
                      <span className="flex flex-wrap gap-2">
                        {u.role === 'Admin' && (
                          <Badge type={enums.GREEN} onClick={() => openEdit(u)}>
                            Edit
                          </Badge>
                        )}
                        <Badge type={enums.RED} onClick={() => deleteUser(u.id)}>
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
      )}

      <Modal
        title={modal.editId ? 'Edit admin limits' : 'Create user'}
        open={modal.open}
        setOpen={(open) => !open && setModal({ open: false, editId: '', data: emptyForm })}
        size="max-w-lg"
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
            <form onSubmit={formik.handleSubmit} className="space-y-4">
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
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    name="maxBatches"
                    label="Max batches"
                    type="number"
                    value={String(formik.values.maxBatches)}
                    onChange={formik.handleChange}
                  />
                  <Input
                    name="maxStudentsPerBatch"
                    label="Max students / batch"
                    type="number"
                    value={String(formik.values.maxStudentsPerBatch)}
                    onChange={formik.handleChange}
                  />
                </div>
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
