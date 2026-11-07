import type { AuthenticatedIdentity } from './auth.js';

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: AuthenticatedIdentity;
    }
  }
}

export {};

