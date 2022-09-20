/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  },
};
