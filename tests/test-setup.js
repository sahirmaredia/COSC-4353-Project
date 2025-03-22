// Set test environment
process.env.NODE_ENV = 'test';

// Keep other environment variables
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'volunteer_matching_test';  // A different DB name
process.env.JWT_SECRET = 'test_secret_key';

console.log('Test setup complete - database operations will be mocked');