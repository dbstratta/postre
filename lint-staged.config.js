module.exports = {
  '*.json': ['prettier --write'],
  '*.{js,ts}': ['yarn lint:fix'],
};
