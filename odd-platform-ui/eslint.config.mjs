import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import { rules as prettierConfigRules } from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import lodashPlugin from 'eslint-plugin-lodash';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = defineConfig([
  // ESLint recommended config
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  // Stylistic plugin
  plugins.stylistic,
  // Import X plugin
  plugins.importX,
  // Airbnb base recommended config
  ...configs.base.recommended,
]);

const reactConfig = defineConfig([
  // React plugin
  plugins.react,
  // React hooks plugin
  plugins.reactHooks,
  // React JSX A11y plugin
  plugins.reactA11y,
  // Airbnb React recommended config
  ...configs.react.recommended,
]);

const typescriptConfig = defineConfig([
  // TypeScript ESLint plugin
  plugins.typescriptEslint,
  // Airbnb base TypeScript config
  ...configs.base.typescript,
  // Airbnb React TypeScript config
  ...configs.react.typescript,
]);

const prettierConfig = defineConfig([
  // Prettier plugin
  {
    name: 'prettier/plugin/config',
    plugins: {
      prettier: prettierPlugin,
    },
  },
  // Prettier config
  {
    name: 'prettier/config',
    rules: {
      ...prettierConfigRules,
      'prettier/prettier': 'warn',
    },
  },
]);

const lodashConfig = defineConfig([
  {
    name: 'lodash/config',
    plugins: {
      lodash: lodashPlugin,
    },
    rules: {
      'lodash/import-scope': ['error', 'method'],
    },
  },
]);

// Custom rules migrated from .eslintrc.json
const customRules = defineConfig([
  {
    name: 'custom/rules',
    rules: {
      // TypeScript rules
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/default-param-last': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/return-await': 'off',
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // Import rules
      'import-x/prefer-default-export': 'off',
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import-x/no-cycle': 'error',
      'import-x/order': 'warn',

      // React rules
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],

      // JSX A11y rules
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/anchor-is-valid': 'off',

      // General rules
      'default-param-last': 'off',
      'no-param-reassign': 'off',
      'consistent-return': 'off',
      'no-restricted-syntax': 'off',
      'guard-for-in': 'off',


      // TODO - Temporary disabled
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  // Override for .tsx files
  {
    name: 'custom/tsx-overrides',
    files: ['**/*.tsx'],
    rules: {
      'react/prop-types': 'off',
    },
  },
]);

export default defineConfig([
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  // Additional ignores (migrated from .eslintignore)
  {
    ignores: ['src/generated-sources/**', '**/*.css'],
  },
  // JavaScript config
  ...jsConfig,
  // React config
  ...reactConfig,
  // TypeScript config
  ...typescriptConfig,
  // Prettier config
  ...prettierConfig,
  // Lodash config
  ...lodashConfig,
  // Custom rules
  ...customRules,
]);
