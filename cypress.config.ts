import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: ['**/*.spec.ts', '**/*.test.ts'],
    setupNodeEvents(on) {
      on(
        'file:preprocessor',
        vitePreprocessor({
          configFile: './vite.config.test.js',
          mode: 'development',
        }),
      );
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
