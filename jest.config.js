module.exports = {
  testEnvironment: 'node',
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!**/node_modules/**', '!**/dist/**'],
  coveragePathIgnorePatterns: [
    'node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/storybookDist/',
  ],
  moduleFileExtensions: ['js', 'ts', 'json'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]s$',
  modulePathIgnorePatterns: ['node_modules', '<rootDir>/dist/'],
  transform: {
    '^.+\\.[jt]s$': 'babel-jest',
  },
  errorOnDeprecated: true,
  watchPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
};
