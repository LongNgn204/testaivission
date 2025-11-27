/**
 * 🧪 Test Frontend → Backend Connection
 * 
 * Test file để verify frontend có thể kết nối với Cloudflare Workers backend
 */

const BACKEND_URL = 'https://vision-coach-worker.stu725114073.workers.dev';

console.log('🚀 Testing Frontend → Backend Connection');
console.log('Backend URL:', BACKEND_URL);

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n1️⃣ Testing Health Check...');
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check OK:', data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error);
    return false;
  }
}

// Test 2: Login
async function testLogin() {
  console.log('\n2️⃣ Testing Login...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Frontend Test User',
        age: 25,
        phone: '0999888777'
      })
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ Login OK:', data.user);
      return data.user.token;
    } else {
      console.error('❌ Login Failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Login Error:', error);
    return null;
  }
}

// Test 3: Save Test Result
async function testSaveResult(token: string) {
  console.log('\n3️⃣ Testing Save Test Result...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/tests/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        testType: 'snellen',
        testData: {
          leftEye: '20/20',
          rightEye: '20/25'
        },
        score: 95,
        duration: 120
      })
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ Save Result OK:', data.testResult);
      return true;
    } else {
      console.error('❌ Save Result Failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Save Result Error:', error);
    return false;
  }
}

// Test 4: Get History
async function testGetHistory(token: string) {
  console.log('\n4️⃣ Testing Get History...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/tests/history?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (data.success) {
      console.log('✅ Get History OK:', data.history.length, 'tests found');
      console.log('   Total:', data.total);
      return true;
    } else {
      console.error('❌ Get History Failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Get History Error:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 Frontend → Backend Connection Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = {
    health: false,
    login: false,
    save: false,
    history: false
  };

  // Test 1: Health
  results.health = await testHealthCheck();
  
  if (!results.health) {
    console.log('\n❌ Health check failed. Backend might be down.');
    return results;
  }

  // Test 2: Login
  const token = await testLogin();
  results.login = !!token;
  
  if (!token) {
    console.log('\n❌ Login failed. Cannot continue tests.');
    return results;
  }

  // Test 3: Save
  results.save = await testSaveResult(token);

  // Test 4: History
  results.history = await testGetHistory(token);

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Health Check: ${results.health ? '✅' : '❌'}`);
  console.log(`Login:        ${results.login ? '✅' : '❌'}`);
  console.log(`Save Result:  ${results.save ? '✅' : '❌'}`);
  console.log(`Get History:  ${results.history ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(r => r);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allPassed) {
    console.log('🎉 All tests PASSED! Frontend ↔ Backend connection is working!');
  } else {
    console.log('⚠️  Some tests FAILED. Check errors above.');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return results;
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).testBackendConnection = runAllTests;
  console.log('💡 Run testBackendConnection() in console to test connection');
}

export { runAllTests, testHealthCheck, testLogin, testSaveResult, testGetHistory };
