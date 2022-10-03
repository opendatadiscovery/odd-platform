/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  root: true,
  env: {
    browser: true,
    amd: true,
    node: true,
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './tsconfig.eslint.json'],
  },
  plugins: ['@typescript-eslint', 'jsdoc'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:playwright/playwright-test',
    'plugin:jsdoc/recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'prettier' /** Make sure to put it last, so it gets the chance to override other configs */,
  ],
  rules: {
    /**
     * After modifying this section, run the CLI helper tool to find problems.
     * https://github.com/prettier/eslint-config-prettier/#cli-helper-tool
     * While the "prettier" config can disable problematic rules in
     * "some-other-config-you-use", it cannot touch "rules"!
     * (That’s how ESLint works – it lets you override configs you extend.)
     * The CLI helper tool reports that conflicts with Prettier, so you can remove it.
     */
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'default', format: ['camelCase'] },

      { selector: 'variableLike', format: ['camelCase'] },
      { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
      { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },

      { selector: 'memberLike', format: ['camelCase'] },
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase'],
      },

      { selector: 'typeLike', format: ['PascalCase'] },
      { selector: 'typeParameter', format: ['PascalCase'], prefix: ['T'] },

      { selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: false } },
    ],

    /**
     * Note: The rules have been temporarily changed from 'error' to 'warn.
     * Delete rules after fixing errors in the code.
     */
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/restrict-template-expressions': 'warn',
    'import/no-extraneous-dependencies': 'warn',
    '@typescript-eslint/no-use-before-define': 'warn',
    'import/prefer-default-export': 'warn',
    'import/no-cycle': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-shadow': 'warn',
    'class-methods-use-this': 'warn',
    'no-await-in-loop': 'warn',
    'no-plusplus': 'warn',
    'no-cond-assign': 'warn',
    'new-cap': 'warn',
    'consistent-return': 'warn',
    'no-nested-ternary': 'warn',
    'no-param-reassign': 'warn',
    'prefer-destructuring': 'warn',
    'no-restricted-syntax': 'warn',
  },
};
