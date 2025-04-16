module.exports = {
  // Set the test environment
  testEnvironment: 'node',
  
  // Handle ESM modules
  transform: {},
  
  // Exclude node_modules from transformation, but allow chai
  transformIgnorePatterns: [
    '/node_modules/(?!chai)/'
  ],
  
  // Use CommonJS for tests
  moduleFileExtensions: ['js', 'json', 'node'],
  
  // Set timeout for tests
  testTimeout: 10000,
}; 