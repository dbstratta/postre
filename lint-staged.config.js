module.exports = {
  '*.json': ['prettier --write', 'git add'],
  '*.{js,ts}': ['prettier-eslint --write', 'git add'],
};
