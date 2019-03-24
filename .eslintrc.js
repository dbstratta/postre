module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },

  plugins: [
    'node',
    'promise',
    'unicorn',
    'jest',
    'import',
    '@typescript-eslint',
    'fp',
    'eslint-comments',
    'prettier',
  ],

  env: {
    es6: true,
    browser: false,
    node: true,
    jest: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
    'plugin:jest/recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:fp/recommended',
    'prettier',
  ],

  rules: {
    'no-use-before-define': 'off',

    'unicorn/filename-case': 'off',

    'import/no-named-as-default': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'import/order': ['error', { 'newlines-between': 'always' }],

    'prettier/prettier': 'error',

    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-unsupported-features/node-builtins': 'off',
    'node/no-unpublished-require': 'off',

    'promise/valid-params': 'off',

    'fp/no-mutation': 'off',
    'fp/no-throw': 'off',
    'fp/no-nil': 'off',
    'fp/no-let': 'off',
    'fp/no-unused-expression': 'off',
    'fp/no-rest-parameters': 'off',
    'fp/no-this': 'off',
    'fp/no-class': 'off',

    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
  },

  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },

  overrides: [
    {
      files: ['**/*.ts'],

      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-restricted-globals': 'off',
        'no-shadow': 'off',
        'prefer-destructuring': 'off',
        'no-multi-str': 'off',

        'import/export': 'off',

        '@typescript-eslint/generic-type-naming': [
          'error',
          '^T[A-Z][a-zA-Z]+$',
        ],
        '@typescript-eslint/no-this-alias': 'error',
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/prefer-interface': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
