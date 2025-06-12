import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleError, logError } from '@/utils/error-handler';

export const useErrorHandler = () => {
  const { toast } = useToast();

  const showError = useCallback((error: unknown, context?: string) => {
    const errorMessage = handleError(error);
    logError(error, context);
    
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }, [toast]);

  const showSuccess = useCallback((message: string, title = 'Success') => {
    toast({
      title,
      description: message,
    });
  }, [toast]);

  const showWarning = useCallback((message: string, title = 'Warning') => {
    toast({
      title,
      description: message,
      variant: 'destructive',
    });
  }, [toast]);

  return {
    showError,
    showSuccess,
    showWarning,
  };
};