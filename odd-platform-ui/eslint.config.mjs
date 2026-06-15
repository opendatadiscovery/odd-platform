import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import lodashPlugin from 'eslint-plugin-lodash';
import i18nextPlugin from 'eslint-plugin-i18next';

const gitignorePath = path.resolve('.', '.gitignore');

export default tseslint.config(
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  // Additional ignores
  {
    ignores: ['src/generated-sources/**', '**/*.css'],
  },

  // Base ESLint recommended config
  js.configs.recommended,

  // TypeScript ESLint recommended configs
  ...tseslint.configs.recommended,

  // React plugin config
  {
    name: 'react/config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'react/display-name': 'off',
    },
  },

  // React Hooks plugin config
  {
    name: 'react-hooks/config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off', // TODO - Temporary disabled
    },
  },

  // JSX A11y plugin config
  {
    name: 'jsx-a11y/config',
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      ...jsxA11yPlugin.flatConfigs.recommended.rules,
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
    },
  },

  // Import plugin config
  {
    name: 'import/config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: true,
      },
    },
    rules: {
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/no-cycle': 'error',
      // TODO: Temporarily disabled
      'import/order': 'off',
    },
  },

  // Unused imports plugin config
  {
    name: 'unused-imports/config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Lodash plugin config
  {
    name: 'lodash/config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      lodash: lodashPlugin,
    },
    rules: {
      'lodash/import-scope': ['error', 'method'],
    },
  },

  // Prettier config (must come after other configs to override conflicting rules)
  {
    name: 'prettier/config',
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
    },
  },

  // Custom TypeScript rules
  {
    name: 'custom/typescript-rules',
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Using unused-imports plugin instead
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // General custom rules
  {
    name: 'custom/general-rules',
    rules: {
      'no-param-reassign': 'off',
      'consistent-return': 'off',
      'no-restricted-syntax': 'off',
      'guard-for-in': 'off',
      'no-unused-vars': 'off', // Using unused-imports plugin instead
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

  // i18n guard — every user-facing string must go through t() so it is translatable
  // (odd-platform#1751 / PLT-205). `jsx-only` checks JSX text nodes + JSX attribute values;
  // code-only attributes are excluded so only user-facing text is flagged. A string that must
  // not be translated can be marked with `{/* i18next-extract-disable-line */}` or moved out of JSX.
  {
    name: 'i18next/no-literal-string',
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/generated-sources/**', 'src/**/__tests__/**', 'src/**/*.test.{ts,tsx}'],
    plugins: { i18next: i18nextPlugin },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          // String arguments to these helpers are code (format-mode enums, DTO property keys),
          // not user-facing text. (Re-lists the plugin defaults — options are not deep-merged.)
          callees: {
            exclude: [
              'i18n(ext)?', 't', 'require', 'addEventListener', 'removeEventListener',
              'postMessage', 'getElementById', 'dispatch', 'commit', 'includes', 'indexOf',
              'endsWith', 'startsWith',
              'stringFormatted', 'getHighlights', 'getListedHighlights',
            ],
          },
          // Allowlist: validate JSX text nodes + ONLY these user-facing text attributes.
          // Every other attribute (layout/style/route/CSS props: variant, color, sx, to, path,
          // flex, width, ...) is code, not translatable text, so it is not checked. Add a new
          // text attribute here if a component introduces one.
          'jsx-attributes': {
            include: [
              'placeholder', 'label', 'title', 'text', 'actionTitle', 'actionName',
              'actionText', 'confirmCheckboxLabel', 'caption', 'header', 'subHeader',
              'description', 'helperText', 'confirmText', 'btnText', 'tooltip', 'hint',
              'message', 'emptyText', 'noOptionsText', 'errorText', 'heading',
            ],
          },
        },
      ],
    },
  }
);
