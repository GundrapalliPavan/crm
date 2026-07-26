import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount between tests so a leaked component tree cannot affect the next one.
afterEach(() => {
  cleanup();
});
