import type { Request, Response } from 'express';
import {
  AdminValidationError,
  getDashboardSummary,
  listAdminDatasets,
  listAdminUsers,
  parseAdminListQuery,
} from '../services/admin.service.js';

export async function dashboard(_request: Request, response: Response): Promise<void> {
  const summary = await getDashboardSummary();
  response.status(200).json({ success: true, data: { summary } });
}

export async function users(request: Request, response: Response): Promise<void> {
  try {
    const result = await listAdminUsers(parseAdminListQuery(request.query));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    handleAdminValidationError(error, response);
  }
}

export async function datasets(request: Request, response: Response): Promise<void> {
  try {
    const result = await listAdminDatasets(parseAdminListQuery(request.query));
    response.status(200).json({ success: true, data: result });
  } catch (error) {
    handleAdminValidationError(error, response);
  }
}

function handleAdminValidationError(error: unknown, response: Response): void {
  if (!(error instanceof AdminValidationError)) {
    throw error;
  }
  response.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Request query parameters are invalid',
      details: [{ code: 'INVALID_VALUE', message: error.message }],
    },
  });
}
