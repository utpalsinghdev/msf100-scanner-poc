export type UserRole = 'MasterAdmin' | 'User';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  maxBatches?: number | null;
  maxStudentsPerBatch?: number | null;
  canAdd?: boolean;
  canEdit?: boolean;
  canView?: boolean;
  canDelete?: boolean;
}

export interface AuthSession {
  Authorization: string;
  expiresIn: string;
  user: SessionUser;
}
