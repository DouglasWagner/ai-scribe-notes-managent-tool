import type { ErrorRequestHandler } from "express";

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const isMulterError = error?.name === "MulterError";
  const statusCode = error instanceof HttpError ? error.statusCode : isMulterError ? 400 : 500;
  const message = statusCode === 500 ? "Unexpected server error" : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: message
  });
};
