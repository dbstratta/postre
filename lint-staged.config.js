module.exports = {
  '*.json': ['prettier --write', 'git add'],
  '*.{js,ts}': ['yarn lint:fix', 'git add'],
};
