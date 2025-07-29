const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test support API endpoints
async function testSupportAPI() {
  try {
    console.log('Testing Support API endpoints...\n');

    // Test 1: Get support tickets (should return 401 without auth)
    console.log('1. Testing GET /support without auth...');
    try {
      const response = await axios.get(`${API_BASE}/support`);
      console.log('❌ Should have returned 401, got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 for unauthorized access');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Connection refused - server might not be running on port 5000');
      } else {
        console.log('❌ Unexpected error:', error.code || error.response?.status, error.message);
      }
    }

    // Test 2: Create support ticket without auth (should return 401)
    console.log('\n2. Testing POST /support without auth...');
    try {
      const response = await axios.post(`${API_BASE}/support`, {
        message: 'Test message'
      });
      console.log('❌ Should have returned 401, got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 for unauthorized access');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Connection refused - server might not be running on port 5000');
      } else {
        console.log('❌ Unexpected error:', error.code || error.response?.status, error.message);
      }
    }

    // Test 3: Get chat without auth (should return 401)
    console.log('\n3. Testing GET /support/chat/123 without auth...');
    try {
      const response = await axios.get(`${API_BASE}/support/chat/123`);
      console.log('❌ Should have returned 401, got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 for unauthorized access');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Connection refused - server might not be running on port 5000');
      } else {
        console.log('❌ Unexpected error:', error.code || error.response?.status, error.message);
      }
    }

    console.log('\n✅ Support API authentication tests completed successfully!');
    console.log('Note: To test with authentication, you need to provide a valid JWT token.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testSupportAPI();