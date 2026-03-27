import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message);

  const statusCode = 'statusCode' in err ? (err as Error & { statusCode: number }).statusCode : 500;

  res.status(statusCode).json({
    error: err.name ?? 'InternalServerError',
    message: err.message ?? 'An unexpected error occurred',
    statusCode,
  });
}

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
