import type { UserRole } from './user.js';

export interface AuthenticatedIdentity {
  id: string;
  role: UserRole;
}

