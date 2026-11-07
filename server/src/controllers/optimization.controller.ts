import type { Request, Response } from 'express';
import {
  OptimizationUnavailableError,
  OptimizationValidationError,
  optimizeWorkload,
} from '../services/optimization.service.js';
import { validateWorkloadInputShape } from '../services/scenario.service.js';

export async function optimize(request: Request, response: Response): Promise<void> {
  if (!request.authenticatedUser) {
    response.status(401).json({
      success: false,
      error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication is required' },
    });
    return;
  }

  try {
    if (!isRecord(request.body) || !('input' in request.body)) {
      throw new OptimizationValidationError('Request body must contain an input object');
    }
    if (
      'estimate' in request.body ||
      'savings' in request.body ||
      'score' in request.body ||
      'dataset' in request.body ||
      'datasetFactors' in request.body
    ) {
      throw new OptimizationValidationError(
        'Estimates, savings, scores, and dataset factors are server-managed',
      );
    }
    const input = validateWorkloadInputShape(request.body.input);
    const result = await optimizeWorkload(input);
    response.status(200).json({ success: true, data: { optimization: result } });
  } catch (error) {
    if (error instanceof OptimizationValidationError) {
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
    if (error instanceof OptimizationUnavailableError) {
      response.status(422).json({
        success: false,
        error: { code: 'OPTIMIZATION_UNAVAILABLE', message: error.message },
      });
      return;
    }
    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
