import type { Request, Response } from 'express';
import {
  authenticateUser,
  findPublicUserById,
  registerUser,
  type LoginInput,
  type RegisterInput,
} from '../services/auth.service.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const email = value.trim().toLowerCase();
  return emailPattern.test(email) ? email : null;
}

function validationFailure(response: Response, details: { field: string; message: string }[]) {
  return response.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Request input is invalid',
      details: details.map((detail) => ({ ...detail, code: 'INVALID_VALUE' })),
    },
  });
}

export async function register(request: Request, response: Response): Promise<void> {
  if (!isRecord(request.body)) {
    validationFailure(response, [{ field: 'body', message: 'Request body must be an object' }]);
    return;
  }

  const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
  const email = normalizeEmail(request.body.email);
  const password = typeof request.body.password === 'string' ? request.body.password : '';
  const details: { field: string; message: string }[] = [];

  if (name.length < 2) {
    details.push({ field: 'name', message: 'Name must contain at least 2 characters' });
  }
  if (!email) {
    details.push({ field: 'email', message: 'A valid email address is required' });
  }
  if (password.length < 8) {
    details.push({ field: 'password', message: 'Password must contain at least 8 characters' });
  }
  if (details.length > 0) {
    validationFailure(response, details);
    return;
  }

  try {
    const result = await registerUser({ name, email: email as string, password });
    response.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful',
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      response.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_REGISTERED',
          message: 'An account with this email already exists',
        },
      });
      return;
    }

    throw error;
  }
}

export async function login(request: Request, response: Response): Promise<void> {
  if (!isRecord(request.body)) {
    validationFailure(response, [{ field: 'body', message: 'Request body must be an object' }]);
    return;
  }

  const email = normalizeEmail(request.body.email);
  const password = typeof request.body.password === 'string' ? request.body.password : '';

  if (!email || password.length === 0) {
    validationFailure(response, [
      { field: 'email', message: 'A valid email address is required' },
      { field: 'password', message: 'Password is required' },
    ]);
    return;
  }

  const result = await authenticateUser({ email, password });

  if (!result) {
    response.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
    return;
  }

  response.status(200).json({
    success: true,
    data: result,
    message: 'Login successful',
  });
}

export async function getCurrentUser(request: Request, response: Response): Promise<void> {
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

  const user = await findPublicUserById(identity.id);

  if (!user) {
    response.status(401).json({
      success: false,
      error: {
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Authenticated account is no longer available',
      },
    });
    return;
  }

  response.status(200).json({
    success: true,
    data: { user },
  });
}

function isDuplicateKeyError(error: unknown): boolean {
  return isRecord(error) && error.code === 11000;
}
