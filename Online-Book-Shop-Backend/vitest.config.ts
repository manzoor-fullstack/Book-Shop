import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // Run test files sequentially — they share one MySQL test database.
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 20000,
    include: ['src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DB_HOST: 'localhost',
      DB_USER: 'root',
      DB_PASSWORD: '',
      DB_NAME: 'book_store_test',
      JWT_SECRET: 'test-secret',
      STRIPE_SECRET_KEY: 'sk_test_dummy',
    },
  },
});
