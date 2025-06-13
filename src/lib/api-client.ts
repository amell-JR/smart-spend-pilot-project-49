import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface RetryConfig {
    maxRetries?: number;
    initialDelay?: number;
    shouldRetry?: (error: any) => boolean;
}

class EnhancedSupabaseClient {
    private client: SupabaseClient<Database>;
    private defaultRetryConfig: Required<RetryConfig>;

    constructor() {
        this.client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        this.defaultRetryConfig = {
            maxRetries: MAX_RETRIES,
            initialDelay: INITIAL_RETRY_DELAY,
            shouldRetry: this.isRetryableError,
        };
    }

    private isRetryableError(error: any): boolean {
        // Network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            return true;
        }

        // CORS errors
        if (error.message?.includes('has been blocked by CORS policy')) {
            return true;
        }

        // Rate limiting
        if (error.status === 429) {
            return true;
        }

        // Server errors
        if (error.status >= 500 && error.status < 600) {
            return true;
        }

        return false;
    }

    private async retryOperation<T>(
        operation: () => Promise<T>,
        config: Required<RetryConfig>,
        attempt = 1
    ): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (attempt > config.maxRetries || !config.shouldRetry(error)) {
                throw error;
            }

            const delay = config.initialDelay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));

            return this.retryOperation(operation, config, attempt + 1);
        }
    }

    async withRetry<T>(
        operation: (client: SupabaseClient<Database>) => Promise<T>,
        config: RetryConfig = {}
    ): Promise<T> {
        const retryConfig = { ...this.defaultRetryConfig, ...config };
        return this.retryOperation(
            () => operation(this.client),
            retryConfig
        );
    }

    // Expose the original client for operations that don't need retry logic
    get raw(): SupabaseClient<Database> {
        return this.client;
    }
}

export const supabase = new EnhancedSupabaseClient();
