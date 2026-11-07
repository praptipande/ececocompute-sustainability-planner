import type { Request, Response } from 'express';

export function getHealth(_request: Request, response: Response): void {
  response.status(200).json({
    success: true,
    message: 'EcoCompute API is running',
    timestamp: new Date().toISOString(),
  });
}

