import type { Request, Response } from 'express';
import {
  createScenario,
  deleteScenario,
  getScenario,
  isScenarioCalculationError,
  listScenarios,
  ScenarioNotFoundError,
  ScenarioValidationError,
  updateScenario,
  validateWorkloadInputShape,
} from '../services/scenario.service.js';

export async function create(request: Request, response: Response): Promise<void> {
  const ownerId = requireOwnerId(request, response);
  if (!ownerId) return;
  const input = readInput(request.body, response);
  if (!input) return;

  try {
    const scenario = await createScenario(ownerId, input);
    response.status(201).json({ success: true, data: { scenario }, message: 'Scenario created' });
  } catch (error) {
    respondToScenarioError(error, response);
  }
}

export async function list(request: Request, response: Response): Promise<void> {
  const ownerId = requireOwnerId(request, response);
  if (!ownerId) return;
  const scenarios = await listScenarios(ownerId);
  response.status(200).json({ success: true, data: { scenarios } });
}

export async function get(request: Request, response: Response): Promise<void> {
  const ownerId = requireOwnerId(request, response);
  if (!ownerId) return;
  const id = readId(request.params.id, response);
  if (!id) return;
  try {
    const scenario = await getScenario(ownerId, id);
    response.status(200).json({ success: true, data: { scenario } });
  } catch (error) {
    respondToScenarioError(error, response);
  }
}

export async function update(request: Request, response: Response): Promise<void> {
  const ownerId = requireOwnerId(request, response);
  if (!ownerId) return;
  const input = readInput(request.body, response);
  if (!input) return;
  const id = readId(request.params.id, response);
  if (!id) return;

  try {
    const scenario = await updateScenario(ownerId, id, input);
    response.status(200).json({ success: true, data: { scenario }, message: 'Scenario updated' });
  } catch (error) {
    respondToScenarioError(error, response);
  }
}

export async function remove(request: Request, response: Response): Promise<void> {
  const ownerId = requireOwnerId(request, response);
  if (!ownerId) return;
  const id = readId(request.params.id, response);
  if (!id) return;
  try {
    await deleteScenario(ownerId, id);
    response.status(204).send();
  } catch (error) {
    respondToScenarioError(error, response);
  }
}

function readInput(body: unknown, response: Response) {
  if (!isRecord(body)) {
    validationFailure(response, 'Request body must be an object');
    return null;
  }
  if ('ownerId' in body || 'estimate' in body || 'latestEstimate' in body) {
    validationFailure(response, 'Owner and estimate fields are server-managed');
    return null;
  }
  try {
    return validateWorkloadInputShape(body.input);
  } catch (error) {
    validationFailure(response, error instanceof Error ? error.message : 'Request input is invalid');
    return null;
  }
}

function requireOwnerId(request: Request, response: Response): string | null {
  const ownerId = request.authenticatedUser?.id;
  if (!ownerId) {
    response.status(401).json({
      success: false,
      error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication is required' },
    });
    return null;
  }
  return ownerId;
}

function respondToScenarioError(error: unknown, response: Response): void {
  if (error instanceof ScenarioValidationError) {
    validationFailure(response, error.message);
    return;
  }
  if (error instanceof ScenarioNotFoundError) {
    response.status(404).json({
      success: false,
      error: { code: 'SCENARIO_NOT_FOUND', message: 'Scenario was not found' },
    });
    return;
  }
  if (isScenarioCalculationError(error)) {
    response.status(422).json({
      success: false,
      error: {
        code: 'ESTIMATION_UNAVAILABLE',
        message: error instanceof Error ? error.message : 'Scenario estimate could not be generated',
      },
    });
    return;
  }
  throw error;
}

function validationFailure(response: Response, message: string): void {
  response.status(400).json({
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'Request input is invalid', details: [{ code: 'INVALID_VALUE', message }] },
  });
}

function readId(value: string | string[] | undefined, response: Response): string | null {
  if (typeof value !== 'string' || !value) {
    validationFailure(response, 'Scenario ID is required');
    return null;
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
