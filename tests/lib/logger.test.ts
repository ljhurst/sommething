import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debug', () => {
    it('logs debug messages with context in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      logger.debug('Test debug message', { userId: '123', action: 'test' });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Test debug message')
      );

      vi.unstubAllEnvs();
    });

    it('does not log debug messages in test/production', () => {
      logger.debug('Test message', { key: 'value' });

      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('logs info messages with context', () => {
      logger.info('User logged in', { userId: '123' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] User logged in'));
    });

    it('includes timestamp in ISO format', () => {
      logger.info('Test message');

      const call = consoleInfoSpy.mock.calls[0][0] as string;
      const timestampMatch = call.match(/\[(.*?)\]/);
      expect(timestampMatch).toBeTruthy();

      const timestamp = new Date(timestampMatch![1]);
      expect(timestamp.toISOString()).toBeTruthy();
    });
  });

  describe('warn', () => {
    it('logs warning messages', () => {
      logger.warn('Deprecated feature', { feature: 'oldAPI' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Deprecated feature')
      );
    });
  });

  describe('error', () => {
    it('logs errors with Error objects', () => {
      const error = new Error('Test error');
      logger.error('Operation failed', error, { userId: '123' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Operation failed'),
        error
      );
    });

    it('handles non-Error objects', () => {
      logger.error('Operation failed', 'string error', { userId: '123' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Operation failed'),
        undefined
      );
    });

    it('includes error message in context', () => {
      const error = new Error('Test error message');
      logger.error('Failed', error);

      const call = consoleErrorSpy.mock.calls[0][0] as string;
      expect(call).toContain('Test error message');
    });
  });

  describe('convenience methods', () => {
    describe('userAction', () => {
      it('logs user actions with structured context', () => {
        logger.userAction('add_wine', 'user-123', {
          wineId: 'wine-456',
          wineName: 'Test Wine',
        });

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining('[INFO] User action: add_wine')
        );

        const call = consoleInfoSpy.mock.calls[0][0] as string;
        expect(call).toContain('user-123');
        expect(call).toContain('add_wine');
      });
    });

    describe('apiCall', () => {
      it('logs API requests in development', () => {
        vi.stubEnv('NODE_ENV', 'development');

        logger.apiCall('POST', '/api/wines', { wineData: { name: 'Test' } });

        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining('[DEBUG] API POST /api/wines')
        );

        vi.unstubAllEnvs();
      });
    });

    describe('apiSuccess', () => {
      it('logs successful API responses', () => {
        logger.apiSuccess('GET', '/api/wines', { count: 5 });

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining('[INFO] API GET /api/wines succeeded')
        );
      });
    });

    describe('apiError', () => {
      it('logs API failures', () => {
        const error = new Error('Network error');
        logger.apiError('POST', '/api/wines', error, { wineId: '123' });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ERROR] API POST /api/wines failed'),
          error
        );
      });
    });

    describe('performance', () => {
      it('logs performance metrics', () => {
        logger.performance('fetchBottles', 250, { spaceId: 'space-123', count: 10 });

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining('[INFO] Performance: fetchBottles')
        );

        const call = consoleInfoSpy.mock.calls[0][0] as string;
        expect(call).toContain('250');
      });
    });
  });

  describe('structured logging', () => {
    it('formats empty context correctly', () => {
      logger.info('Message without context');

      const call = consoleInfoSpy.mock.calls[0][0] as string;
      expect(call).not.toContain('{}');
      expect(call).toContain('[INFO] Message without context');
    });

    it('formats complex nested context', () => {
      logger.info('Complex data', {
        user: { id: '123', name: 'Test' },
        metadata: { timestamp: Date.now(), version: 1 },
      });

      const call = consoleInfoSpy.mock.calls[0][0] as string;
      expect(call).toContain('"id":"123"');
      expect(call).toContain('"name":"Test"');
    });

    it('handles context with undefined values', () => {
      logger.info('Test', { defined: 'value', undefined: undefined });

      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });
});
