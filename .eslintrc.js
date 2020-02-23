module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
    node: true,
    es6: true
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
  ]
}