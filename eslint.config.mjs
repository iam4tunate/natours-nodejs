import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.js'], // Apply to all JavaScript files
    languageOptions: {
      sourceType: 'commonjs', // Use CommonJS for Node.js
      globals: {
        ...globals.node, // Add Node.js globals (e.g., `process`, `__dirname`)
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { args: 'after-used', argsIgnorePattern: '^next$' },
      ], // Ignore unused `next`
    },
  },
  pluginJs.configs.recommended, // Use ESLint's recommended rules
];
