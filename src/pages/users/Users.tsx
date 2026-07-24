import { useEffect, useState } from 'react';
import Api from '@/lib/api';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/Loader';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Formik } from 'formik';
import Badge, { enums } from '@/components/ui/Badge';
import type { UserRole } from '@/types/auth';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { formatDate } from '@/lib/formatDate';

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plainPassword: string | null;
  maxBatches: number | null;
  maxStudentsPerBatch: number | null;
  canAdd: boolean;
  canEdit: boolean;
  canView: boolean;
  canDelete: boolean;
  createdAt: string;
  _count: { batches: number };
};

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'User' as UserRole,
  maxBatches: 5,
  maxStudentsPerBatch: 45,
  canAdd: true,
  canEdit: true,
  canView: true,
  canDelete: true,
};

function roleLabel(role: UserRole) {
  return role === 'MasterAdmin' ? 'Master Admin' : 'User';
}

function PermissionCheckboxes({
  values,
  onChange,
}: {
  values: typeof emptyForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const perms = [
    { name: 'canAdd', label: 'Add' },
    { name: 'canEdit', label: 'Edit' },
    { name: 'canView', label: 'View' },
    { name: 'canDelete', label: 'Delete' },
  ] as const;

  return (
    <fieldset className="rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-medium text-slate-700">Access permissions</legend>
      <p className="mb-3 text-xs text-slate-500">
        Control what this user can do with batches and students.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {perms.map(({ name, label }) => (
          <label key={name} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name={name}
              checked={values[name]}
              onChange={onChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function UserCard({
  user,
  onEdit,
  onDelete,
  onView,
}: {
  user: ManagedUser;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
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
          {roleLabel(user.role)}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-slate-400">Created</dt>
          <dd className="mt-0.5 font-semibold text-slate-800">{formatDate(user.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Password</dt>
          <dd className="mt-0.5 font-mono font-semibold text-slate-800">
            {user.plainPassword ?? '—'}
          </dd>
        </div>
        {user.role === 'User' && (
          <>
            <div>
              <dt className="text-slate-400">Batch limit</dt>
              <dd className="mt-0.5 font-semibold text-slate-800">{user.maxBatches}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Students/batch</dt>
              <dd className="mt-0.5 font-semibold text-slate-800">{user.maxStudentsPerBatch}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Batches used</dt>
              <dd className="mt-0.5 font-semibold text-slate-800">{user._count.batches}</dd>
            </div>
          </>
        )}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Badge type={enums.BLUE} onClick={onView}>
          View
        </Badge>
        {user.role === 'User' && (
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
  const [viewUser, setViewUser] = useState<ManagedUser | null>(null);
  const [modal, setModal] = useState<{
    open: boolean;
    editId: string;
    data: typeof emptyForm;
  }>({ open: false, editId: '', data: emptyForm });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        canAdd: u.canAdd,
        canEdit: u.canEdit,
        canView: u.canView,
        canDelete: u.canDelete,
      },
    });

  const deleteUser = async () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      const res = await Api.delete(`api/user/${pendingDeleteId}`);
      toast.success(res.data.message);
      setPendingDeleteId(null);
      fetchUsers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader
        title="User management"
        subtitle="Create Master Admins and Users with limits and access control"
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
                onView={() => setViewUser(u)}
                onEdit={() => openEdit(u)}
                onDelete={() => setPendingDeleteId(u.id)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {[
                  'Name',
                  'ID',
                  'Role',
                  'Password',
                  'Created',
                  'Batch limit',
                  'Students/batch',
                  'Batches',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 lg:px-6"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No users yet. Create your first User or Master Admin.
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
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-slate-600 lg:px-6">
                      {u.plainPassword ?? '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 lg:px-6">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-slate-600 lg:px-6">
                      {u.role === 'User' ? u.maxBatches : '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 lg:px-6">
                      {u.role === 'User' ? u.maxStudentsPerBatch : '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 lg:px-6">{u._count.batches}</td>
                    <td className="px-4 py-4 lg:px-6">
                      <span className="flex flex-wrap gap-2">
                        <Badge type={enums.BLUE} onClick={() => setViewUser(u)}>
                          View
                        </Badge>
                        {u.role === 'User' && (
                          <Badge type={enums.GREEN} onClick={() => openEdit(u)}>
                            Edit
                          </Badge>
                        )}
                        <Badge type={enums.RED} onClick={() => setPendingDeleteId(u.id)}>
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
        title="User details"
        open={!!viewUser}
        setOpen={(open) => !open && setViewUser(null)}
        size="max-w-md"
      >
        {viewUser && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{viewUser.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Account ID</dt>
              <dd className="font-medium text-slate-900">{viewUser.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium text-slate-900">{roleLabel(viewUser.role)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Password</dt>
              <dd className="font-mono font-medium text-slate-900">
                {viewUser.plainPassword ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Created</dt>
              <dd className="font-medium text-slate-900">{formatDate(viewUser.createdAt)}</dd>
            </div>
            {viewUser.role === 'User' && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Batch limit</dt>
                  <dd className="font-medium text-slate-900">{viewUser.maxBatches}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Students per batch</dt>
                  <dd className="font-medium text-slate-900">{viewUser.maxStudentsPerBatch}</dd>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <dt className="mb-2 text-slate-500">Permissions</dt>
                  <dd className="flex flex-wrap gap-2">
                    {[
                      ['Add', viewUser.canAdd],
                      ['Edit', viewUser.canEdit],
                      ['View', viewUser.canView],
                      ['Delete', viewUser.canDelete],
                    ].map(([label, enabled]) => (
                      <span
                        key={label as string}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          enabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {label as string}
                      </span>
                    ))}
                  </dd>
                </div>
              </>
            )}
          </dl>
        )}
      </Modal>

      <Modal
        title={modal.editId ? 'Edit user' : 'Create user'}
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
                  canAdd: values.canAdd,
                  canEdit: values.canEdit,
                  canView: values.canView,
                  canDelete: values.canDelete,
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
                      <option value="User">User</option>
                      <option value="MasterAdmin">Master Admin</option>
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
              {formik.values.role === 'User' && (
                <>
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
                  <PermissionCheckboxes values={formik.values} onChange={formik.handleChange} />
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

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        title="Delete user"
        message="Delete this user? This cannot be undone."
        loading={deleting}
        onCancel={() => !deleting && setPendingDeleteId(null)}
        onConfirm={deleteUser}
      />
    </div>
  );
}
