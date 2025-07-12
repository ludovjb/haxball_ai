import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    },
    ignores: ['node_modules/', 'dist/', 'coverage/'],
  },
  {
    files: ['**/*.browser.{js,ts}',],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },
]);