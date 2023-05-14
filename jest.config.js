module.exports = {
  testMatch: ['**/test/**/*.test.ts'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globals: {
    __TEST__: true
  }
};
