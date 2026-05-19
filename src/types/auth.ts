export type UserRole = 'MasterAdmin' | 'Admin';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  maxBatches?: number | null;
  maxStudentsPerBatch?: number | null;
}

export interface AuthSession {
  Authorization: string;
  expiresIn: string;
  user: SessionUser;
}
