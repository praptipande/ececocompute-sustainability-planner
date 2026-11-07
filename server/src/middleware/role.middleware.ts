import type { RequestHandler } from 'express';
import type { UserRole } from '../types/user.js';

export function requireRoles(...permittedRoles: UserRole[]): RequestHandler {
  return (request, response, next) => {
    const identity = request.authenticatedUser;

    if (!identity) {
      response.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication is required',
        },
      });
      return;
    }

    if (!permittedRoles.includes(identity.role)) {
      response.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource',
        },
      });
      return;
    }

    next();
  };
}

