import '@testing-library/jest-dom';
import { beforeAll, afterAll } from 'vitest';

const originalConsoleError = console.error;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Not implemented: HTMLFormElement.prototype.requestSubmit') ||
        message.includes('An update to') ||
        message.includes('was not wrapped in act'))
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
