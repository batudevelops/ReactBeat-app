module.exports = {
  preset: '@react-native/jest-preset',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/functions/',
    '<rootDir>/__tests__/App.test.tsx',
  ],
};
