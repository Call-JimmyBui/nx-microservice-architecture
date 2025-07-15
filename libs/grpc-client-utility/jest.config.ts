export default {
  displayName: 'grpc-client-utility',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/grpc-client-utility',
  passWithNoTests: true,
  testMatch: ['<rootDir>/src/lib/**/*.spec.ts', '<rootDir>/src/lib/**/*.test.ts'],
};
