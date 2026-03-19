/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testMatch: ['**/tests/api/**/*.e2e.spec.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/build/',
    '/dist/',
    '/coverage/',
    '\\.spec\\.ts$',
    '\\.test\\.ts$'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: ['/node_modules/(?!(\\.pnpm|@faker-js\\/faker|nanoid)/)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, isolatedModules: true }],
    '^.+\\.jsx?$': 'babel-jest'
  },
  maxWorkers: 1, // E2E tests run sequentially
  cache: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false
}
