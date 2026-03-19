/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testMatch: ['**/tests/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/api/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/build/',
    '/dist/',
    '/coverage/',
    '\\.spec\\.ts$',
    '\\.test\\.ts$',
    '/src/main/index.ts',
    '/src/infra/web/server.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: ['/node_modules/(?!(\\.pnpm|@faker-js\\/faker|nanoid)/)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, isolatedModules: true }],
    '^.+\\.jsx?$': 'babel-jest'
  },
  // Performance optimizations
  maxWorkers: '50%',
  cache: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
}
