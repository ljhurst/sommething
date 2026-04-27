import { useState, useCallback } from 'react';
import { getErrorMessage } from '@/lib/errorHandling';

type AsyncOperation<TResult> = () => Promise<TResult>;

export function useSupabaseOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async <TResult>(
      operation: AsyncOperation<TResult>,
      errorMessage: string
    ): Promise<TResult | null> => {
      try {
        setLoading(true);
        setError(null);
        return await operation();
      } catch (err) {
        const message = getErrorMessage(err, errorMessage);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const executeWithBool = useCallback(
    async (operation: AsyncOperation<void>, errorMessage: string): Promise<boolean> => {
      const result = await execute(async () => {
        await operation();
        return true;
      }, errorMessage);
      return result !== null;
    },
    [execute]
  );

  return { loading, error, setError, execute, executeWithBool };
}
