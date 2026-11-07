import type { Request, Response } from 'express';
import {
  compareOwnedScenarios,
  ComparisonNotFoundError,
  ComparisonUnavailableError,
  ComparisonValidationError,
  validateComparisonScenarioIds,
} from '../services/comparison.service.js';

export async function createComparison(
  request: Request,
  response: Response,
): Promise<void> {
  const ownerId = request.authenticatedUser?.id;
  if (!ownerId) {
    response.status(401).json({
      success: false,
      error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication is required' },
    });
    return;
  }

  try {
    const body = request.body;
    if (!isRecord(body)) {
      throw new ComparisonValidationError('Request body must be an object');
    }
    if ('ownerId' in body || 'userId' in body) {
      throw new ComparisonValidationError('Ownership fields are server-managed');
    }

    const scenarioIds = validateComparisonScenarioIds(body.scenarioIds);
    const comparison = await compareOwnedScenarios(ownerId, scenarioIds);
    response.status(200).json({ success: true, data: { comparison } });
  } catch (error) {
    if (error instanceof ComparisonValidationError) {
      response.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request input is invalid',
          details: [{ code: 'INVALID_VALUE', message: error.message }],
        },
      });
      return;
    }
    if (error instanceof ComparisonNotFoundError) {
      response.status(404).json({
        success: false,
        error: { code: 'SCENARIOS_NOT_FOUND', message: 'One or more scenarios were not found' },
      });
      return;
    }
    if (error instanceof ComparisonUnavailableError) {
      response.status(422).json({
        success: false,
        error: { code: 'COMPARISON_UNAVAILABLE', message: error.message },
      });
      return;
    }
    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
