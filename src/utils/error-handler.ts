import { AuthError, ApiError, CustomError, isAuthError, isApiError } from '@/types/errors';

export const handleError = (error: unknown): string => {
  if (isAuthError(error)) {
    return error.message;
  }

  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof CustomError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export const logError = (error: unknown, context?: string) => {
  const errorMessage = handleError(error);
  const logContext = context ? `[${context}]` : '';
  
  console.error(`${logContext} Error:`, {
    message: errorMessage,
    error,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });
};

export const createApiError = (message: string, code?: string): ApiError => ({
  message,
  code,
});

export const createAuthError = (message: string, status?: number): AuthError => ({
  message,
  status,
});