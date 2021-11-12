module.exports = {
  testEnvironment: 'node',
  name: 'backend',
  displayName: 'backend',
  testRegex: '.*\\.spec\\.ts$',
  rootDir: '.',
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['**/*.service.ts'],
  coverageDirectory: './coverage',
}
