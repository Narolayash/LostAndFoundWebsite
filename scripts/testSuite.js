const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper to perform fetch requests using Node native fetch (available in modern Node)
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const text = await response.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch (e) {
    // Return raw text if not JSON
    data = text;
  }
  return {
    status: response.status,
    success: response.ok,
    data,
  };
}

async function runTests() {
  console.log('\x1b[36m====================================================\x1b[0m');
  console.log('\x1b[36m        CAMPUS LOST & FOUND INTEGRATION TEST SUITE   \x1b[0m');
  console.log('\x1b[36m====================================================\x1b[0m\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      passed++;
      console.log(`  \x1b[32m✓ PASS\x1b[0m: ${message}`);
    } else {
      failed++;
      console.log(`  \x1b[31m✗ FAIL\x1b[0m: ${message}`);
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Server Availability Check
    // ----------------------------------------------------
    console.log('Running Test 1: Check if server is running on port 3000...');
    const ping = await request('/');
    assert(ping.status === 200, 'Server is running and returned HTTP 200');

    if (ping.status !== 200) {
      console.error('\x1b[31mError: Dev server is not running on http://localhost:3000. Please start the dev server before testing.\x1b[0m');
      process.exit(1);
    }

    // ----------------------------------------------------
    // TEST 2: Create a Lost Item
    // ----------------------------------------------------
    console.log('\nRunning Test 2: Create a new lost item...');
    const testLostItem = {
      title: 'Test Case Leather Wallet',
      category: 'Wallet',
      type: 'lost',
      description: 'Lost brown leather wallet during test run.',
      location: 'Block D Corridor',
      date: '2026-06-13',
      personName: 'Tester Yash',
      phone: '+1 999-999-9999',
      imageUrl: 'https://images.unsplash.com/photo-1627124118317-4e359f293124?w=500',
    };

    const createRes = await request('/api/items', {
      method: 'POST',
      body: JSON.stringify(testLostItem),
    });

    assert(createRes.status === 201 && createRes.data.success, 'Successfully created lost item');
    assert(createRes.data.editToken !== undefined, 'Server returned secure editToken');
    
    const itemId = createRes.data.item?._id;
    const itemToken = createRes.data.editToken;

    // ----------------------------------------------------
    // TEST 3: Retrieve Item Details
    // ----------------------------------------------------
    console.log('\nRunning Test 3: Retrieve item details by ID...');
    const detailRes = await request(`/api/items/${itemId}`);
    assert(detailRes.status === 200 && detailRes.data.success, 'Successfully loaded details');
    assert(detailRes.data.item.editToken === undefined, 'Secure editToken is hidden in details payloads');

    // ----------------------------------------------------
    // TEST 4: Unauthorized Status Update
    // ----------------------------------------------------
    console.log('\nRunning Test 4: Attempt status update WITHOUT token...');
    const unauthorizedUpdate = await request(`/api/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'recovered' }),
    });
    assert(unauthorizedUpdate.status === 403, 'Correctly blocks status change without edit token (HTTP 403)');

    // ----------------------------------------------------
    // TEST 5: Authorized Status Update
    // ----------------------------------------------------
    console.log('\nRunning Test 5: Attempt status update WITH edit token...');
    const authorizedUpdate = await request(`/api/items/${itemId}`, {
      method: 'PUT',
      headers: { 'x-edit-token': itemToken },
      body: JSON.stringify({ status: 'recovered' }),
    });
    assert(authorizedUpdate.status === 200 && authorizedUpdate.data.success, 'Allows status update when correct token is supplied');
    assert(authorizedUpdate.data.item.status === 'recovered', 'Status changed to recovered successfully');

    // ----------------------------------------------------
    // TEST 6: Message Logs and Chat Posting
    // ----------------------------------------------------
    console.log('\nRunning Test 6: Verify open communication chat logs...');
    // Post Message
    const msgPostRes = await request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        itemId,
        senderName: 'Assistant Bot',
        message: 'This is a test message to coordinate recovery.',
      }),
    });
    assert(msgPostRes.status === 201 && msgPostRes.data.success, 'Successfully posted message to chat');

    // Get Messages
    const msgGetRes = await request(`/api/messages/${itemId}`);
    assert(msgGetRes.status === 200 && msgGetRes.data.success, 'Successfully retrieved chat logs');
    assert(msgGetRes.data.messages.length > 0, 'Chat log contains the test message');
    assert(msgGetRes.data.messages[0].senderName === 'Assistant Bot', 'Sender name matches the posted message');

    // ----------------------------------------------------
    // TEST 7: Unauthorized Deletion
    // ----------------------------------------------------
    console.log('\nRunning Test 7: Attempt report deletion WITHOUT token...');
    const unauthorizedDelete = await request(`/api/items/${itemId}`, {
      method: 'DELETE',
    });
    assert(unauthorizedDelete.status === 403, 'Correctly blocks report deletion without token (HTTP 403)');

    // ----------------------------------------------------
    // TEST 8: Authorized Deletion
    // ----------------------------------------------------
    console.log('\nRunning Test 8: Attempt report deletion WITH token...');
    const authorizedDelete = await request(`/api/items/${itemId}`, {
      method: 'DELETE',
      headers: { 'x-edit-token': itemToken },
    });
    assert(authorizedDelete.status === 200 && authorizedDelete.data.success, 'Allows deletion when correct token is supplied');

    // Double-check the item is gone
    const checkDeleted = await request(`/api/items/${itemId}`);
    assert(checkDeleted.status === 404, 'Report successfully deleted from database (HTTP 404 details check)');

    // Double-check messages are gone
    const checkMsgsDeleted = await request(`/api/messages/${itemId}`);
    assert(checkMsgsDeleted.data.messages.length === 0, 'Associated messages deleted successfully');

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('\n\x1b[36m====================================================\x1b[0m');
    console.log(`\x1b[36m                  TEST SUITE SUMMARY                \x1b[0m`);
    console.log('\x1b[36m====================================================\x1b[0m');
    console.log(`  Total Tests Run: ${passed + failed}`);
    console.log(`  Passed:          \x1b[32m${passed}\x1b[0m`);
    console.log(`  Failed:          \x1b[31m${failed}\x1b[0m`);
    console.log('\x1b[36m====================================================\x1b[0m\n');

    if (failed > 0) {
      console.log('\x1b[31mTests failed. Please inspect logs to resolve code bugs.\x1b[0m');
      process.exit(1);
    } else {
      console.log('\x1b[32mAll backend APIs, schemas, token authentications, and data lifecycles are fully working!\x1b[0m');
      process.exit(0);
    }

  } catch (err) {
    console.error('\x1b[31mTest Suite encountered an unexpected execution error:\x1b[0m', err);
    process.exit(1);
  }
}

runTests();
