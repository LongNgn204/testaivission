/**
 * ============================================================
 * 🧪 Backend Test Script
 * ============================================================
 * 
 * Tests all backend endpoints
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, path, body = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         🧪 Vision Coach Backend Test Suite                ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  let token = null;
  let userId = null;

  // Test 1: Health Check
  log('Test 1: Health Check', 'blue');
  let result = await testEndpoint('GET', '/health');
  if (result.ok) {
    log('✅ Health check passed', 'green');
    log(`   Status: ${result.data.status}`, 'green');
  } else {
    log('❌ Health check failed', 'red');
    log(`   Error: ${result.error || result.data.message}`, 'red');
  }

  // Test 2: Login
  log('\nTest 2: User Login', 'blue');
  result = await testEndpoint('POST', '/api/auth/login', {
    name: 'Nguyễn Văn A',
    age: '30',
    phone: '0123456789',
  });
  if (result.ok && result.data.success) {
    log('✅ Login successful', 'green');
    token = result.data.user.token;
    userId = result.data.user.id;
    log(`   User ID: ${userId}`, 'green');
    log(`   Token: ${token.substring(0, 20)}...`, 'green');
  } else {
    log('❌ Login failed', 'red');
    log(`   Error: ${result.data.message}`, 'red');
  }

  // Test 3: Verify Token
  log('\nTest 3: Verify Token', 'blue');
  if (token) {
    result = await testEndpoint('POST', '/api/auth/verify', { token });
    if (result.ok && result.data.success) {
      log('✅ Token verification successful', 'green');
      log(`   User: ${result.data.user.name}`, 'green');
    } else {
      log('❌ Token verification failed', 'red');
      log(`   Error: ${result.data.message}`, 'red');
    }
  } else {
    log('⏭️  Skipped (no token)', 'yellow');
  }

  // Test 4: Generate Report
  log('\nTest 4: Generate AI Report', 'blue');
  if (token) {
    result = await testEndpoint(
      'POST',
      '/api/report',
      {
        testType: 'snellen',
        testData: {
          leftEye: 20 / 20,
          rightEye: 20 / 25,
          timestamp: new Date().toISOString(),
        },
        language: 'vi',
      },
      token
    );
    if (result.ok && result.data.success) {
      log('✅ Report generation successful', 'green');
      log(`   Report ID: ${result.data.id}`, 'green');
    } else {
      log('❌ Report generation failed', 'red');
      log(`   Error: ${result.data.message}`, 'red');
    }
  } else {
    log('⏭️  Skipped (no token)', 'yellow');
  }

  // Test 5: Chat
  log('\nTest 5: Chat with Dr. Eva', 'blue');
  if (token) {
    result = await testEndpoint(
      'POST',
      '/api/chat',
      {
        message: 'Tôi bị mỏi mắt sau khi làm việc. Tôi nên làm gì?',
        language: 'vi',
      },
      token
    );
    if (result.ok && result.data.success) {
      log('✅ Chat successful', 'green');
      log(`   Response: ${result.data.message.substring(0, 100)}...`, 'green');
    } else {
      log('❌ Chat failed', 'red');
      log(`   Error: ${result.data.message}`, 'red');
    }
  } else {
    log('⏭️  Skipped (no token)', 'yellow');
  }

  // Test 6: Generate Routine
  log('\nTest 6: Generate Personalized Routine', 'blue');
  if (token) {
    result = await testEndpoint(
      'POST',
      '/api/routine',
      {
        userProfile: {
          age: 30,
          occupation: 'Software Engineer',
          screenTimeHours: 8,
        },
        language: 'vi',
      },
      token
    );
    if (result.ok && result.data.success) {
      log('✅ Routine generation successful', 'green');
    } else {
      log('❌ Routine generation failed', 'red');
      log(`   Error: ${result.data.message}`, 'red');
    }
  } else {
    log('⏭️  Skipped (no token)', 'yellow');
  }

  // Test 7: Proactive Tip
  log('\nTest 7: Generate Proactive Tip', 'blue');
  if (token) {
    result = await testEndpoint(
      'POST',
      '/api/proactive-tip',
      {
        userProfile: {
          age: 30,
          occupation: 'Software Engineer',
        },
        language: 'vi',
      },
      token
    );
    if (result.ok && result.data.success) {
      log('✅ Tip generation successful', 'green');
      log(`   Tip: ${result.data.tip}`, 'green');
    } else {
      log('❌ Tip generation failed', 'red');
      log(`   Error: ${result.data.message}`, 'red');
    }
  } else {
    log('⏭️  Skipped (no token)', 'yellow');
  }

  // Test 8: Dashboard Insights
  log('\nTest 8: Generate Dashboard Insights', 'blue');
  if (token) {
    result = await testEndpoint(
      'POST',
      '/api/dashboard',
      {
        testHistory: [
          {
            testType: 'snellen',
            date: new Date().toISOString(),
            result: '20/20',
          },
        ],
        language: 'vi',
      },
      token
    );
    if (result.ok && result.data.success) {
      log('✅ Dashboard insights generation successful', 'green');
    } else {
      log('❌ Dashboard insights generation failed', 'red');
      log(`   Error: ${result.data.message}`, 'red');
    }
  } else {
    log('⏭️  Skipped (no token)', 'yellow');
  }

  // Test 9: Logout
  log('\nTest 9: User Logout', 'blue');
  if (token) {
    result = await testEndpoint('POST', '/api/auth/logout', { token });
    if (result.ok && result.data.success) {
      log('✅ Logout successful', 'green');
    } else {
      log('❌ Logout failed', 'red');
      log(`   Error: ${result.data.message}`, 'red');
    }
  } else {
    log('⏭️  Skipped (no token)', 'yellow');
  }

  // Test 10: Metrics
  log('\nTest 10: Metrics', 'blue');
  result = await testEndpoint('GET', '/metrics');
  if (result.ok) {
    log('✅ Metrics retrieved', 'green');
    log(`   Uptime: ${result.data.uptime.toFixed(2)}s`, 'green');
  } else {
    log('❌ Metrics retrieval failed', 'red');
  }

  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                  ✅ Test Suite Complete                    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});

