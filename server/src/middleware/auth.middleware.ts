import type { RequestHandler } from 'express';
import jwt, { type JwtPayload, type VerifyOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import type { UserRole } from '../types/user.js';

const JWT_ISSUER = 'ecocompute-api';
const JWT_ALGORITHMS: VerifyOptions['algorithms'] = ['HS256'];
const USER_ROLES: readonly UserRole[] = ['user', 'admin'];

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
}

function isValidTokenPayload(value: string | JwtPayload): value is JwtPayload {
  if (typeof value === 'string') {
    return false;
  }

  return (
    typeof value.sub === 'string' &&
    mongoose.Types.ObjectId.isValid(value.sub) &&
    isUserRole(value.role)
  );
}

export const requireAuthentication: RequestHandler = (request, response, next) => {
  const authorization = request.header('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    response.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication is required',
      },
    });
    return;
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    response.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      },
    });
    return;
  }

  try {
    const verified = jwt.verify(token, env.jwtSecret, {
      algorithms: JWT_ALGORITHMS,
      issuer: JWT_ISSUER,
    });

    if (!isValidTokenPayload(verified)) {
      response.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token',
        },
      });
      return;
    }

    const subject = verified.sub;
    if (typeof subject !== 'string') {
      response.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token',
        },
      });
      return;
    }

    request.authenticatedUser = {
      id: subject,
      role: verified.role,
    };
    next();
  } catch {
    response.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      },
    });
  }
};
