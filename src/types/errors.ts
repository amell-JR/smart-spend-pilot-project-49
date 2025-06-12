export interface AuthError {
  message: string;
  status?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class CustomError extends Error {
  public code?: string;
  public status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.status = status;
  }
}

export const isAuthError = (error: unknown): error is AuthError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};