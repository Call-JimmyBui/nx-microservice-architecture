export default {
  displayName: 'common',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/common',
  passWithNoTests: true,
  testMatch: ['<rootDir>/src/lib/**/*.spec.ts', '<rootDir>/src/lib/**/*.test.ts'],
};
