import type { Request, Response } from 'express';
import {
  generateRecommendations,
  RecommendationUnavailableError,
  RecommendationValidationError,
} from '../services/recommendation.service.js';
import {
  ScenarioValidationError,
  validateWorkloadInputShape,
} from '../services/scenario.service.js';

export async function recommend(request: Request, response: Response): Promise<void> {
  if (!request.authenticatedUser) {
    response.status(401).json({
      success: false,
      error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication is required' },
    });
    return;
  }

  try {
    if (!isRecord(request.body) || !('input' in request.body)) {
      throw new RecommendationValidationError('Request body must contain an input object');
    }
    if (
      'estimate' in request.body ||
      'savings' in request.body ||
      'score' in request.body ||
      'dataset' in request.body ||
      'datasetFactors' in request.body
    ) {
      throw new RecommendationValidationError(
        'Estimates, savings, scores, and dataset factors are server-managed',
      );
    }
    const input = validateWorkloadInputShape(request.body.input);
    const requestedObjective = request.body.objective;
    const result = await generateRecommendations(input, requestedObjective);
    response.status(200).json({ success: true, data: { recommendations: result } });
  } catch (error) {
    if (error instanceof RecommendationValidationError || error instanceof ScenarioValidationError) {
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
    if (error instanceof RecommendationUnavailableError) {
      response.status(422).json({
        success: false,
        error: { code: 'RECOMMENDATIONS_UNAVAILABLE', message: error.message },
      });
      return;
    }
    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
