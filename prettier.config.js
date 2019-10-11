module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  overrides: [
    {
      files: '*.json',
      options: { trailingComma: 'none' },
    },
  ],
};
