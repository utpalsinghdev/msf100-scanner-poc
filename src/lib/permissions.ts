import type { SessionUser } from '@/types/auth';

export function canPerform(
  user: SessionUser | null,
  action: 'add' | 'edit' | 'view' | 'delete',
): boolean {
  if (!user) return false;
  if (user.role === 'MasterAdmin') return true;
  const map = {
    add: user.canAdd,
    edit: user.canEdit,
    view: user.canView,
    delete: user.canDelete,
  };
  return map[action] !== false;
}
