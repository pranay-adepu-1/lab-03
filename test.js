/**
 * Student Name: Adepu Pranay Kumar
 * Registration Number: 252U1R1002
 * Section: CSE-2A(S-15)
 * Course: B.Tech CSE (Backend Development Fundamentals - Year II Term II)
 * Institution: Aurora University
 * Faculty: MR.sai shiva teja
 * 
 * Comprehensive Automated Test Suite for Lab 03 REST API
 */

const http = require('node:http');
const { app } = require('./server');
const db = require('./database');

const PIPE_NAME = `\\\\.\\pipe\\lab03-test-${Date.now()}`;

let server;
let passedCount = 0;
let failedCount = 0;

function logPass(desc) {
  console.log(`  \x1b[32m✔ PASS:\x1b[0m ${desc}`);
  passedCount++;
}

function logFail(desc, details) {
  console.error(`  \x1b[31m✘ FAIL:\x1b[0m ${desc}`);
  if (details) console.error(`         Details: ${typeof details === 'object' ? JSON.stringify(details) : details}`);
  failedCount++;
}

/**
 * Perform real HTTP request to the running server via named pipe
 */
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {};
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request({
      socketPath: PIPE_NAME,
      path,
      method: method.toUpperCase(),
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch {
          // keep as string
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log(`\n===========================================================`);
  console.log(` Aurora University - Backend Development Fundamentals (Term II)`);
  console.log(` Lab 3: REST API, query parameters, validation, debugging`);
  console.log(` Student: Adepu Pranay Kumar | Reg: 252U1R1002`);
  console.log(` Section: CSE-2A(S-15) | Faculty: MR.sai shiva teja`);
  console.log(`===========================================================\n`);

  // Initialize DB and start real HTTP server on named pipe
  await db.exec('DROP TABLE IF EXISTS books;');
  await db.initDatabase();

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(PIPE_NAME, resolve));

  try {
    // 1. Root & Student Info Endpoint
    console.log(`\x1b[36m[Test Group 1] Root & Student Details Endpoint (GET /)\x1b[0m`);
    {
      const res = await request('GET', '/');
      if (res.status === 200 && res.body.studentDetails && res.body.studentDetails.name === 'Adepu Pranay Kumar') {
        logPass('GET / returns 200 OK with verified student metadata and API route map');
      } else {
        logFail('GET / did not return expected student metadata', res.body);
      }
    }

    // 2. GET /books - Default query parameters
    console.log(`\n\x1b[36m[Test Group 2] GET /books - Default Query Parameters\x1b[0m`);
    {
      const res = await request('GET', '/books');
      if (res.status === 200 && Array.isArray(res.body.books) && res.body.limit === 10 && res.body.offset === 0 && res.body.total >= 10) {
        logPass(`GET /books returns 200 OK with default limit (10), offset (0), and total count (${res.body.total})`);
      } else {
        logFail('GET /books failed with default parameters', res.body);
      }
    }

    // 3. GET /books?search_q=... (Partial title match using LIKE)
    console.log(`\n\x1b[36m[Test Group 3] GET /books?search_q= (Partial LIKE search on title)\x1b[0m`);
    {
      const res = await request('GET', '/books?search_q=Clean');
      if (res.status === 200 && res.body.books.length === 1 && res.body.books[0].title === 'Clean Code') {
        logPass('GET /books?search_q=Clean matches "Clean Code" correctly with LIKE');
      } else {
        logFail('search_q failed to match "Clean Code"', res.body);
      }
    }
    {
      const res = await request('GET', '/books?search_q=Patterns');
      if (res.status === 200 && res.body.books.length >= 2) {
        logPass(`GET /books?search_q=Patterns matched ${res.body.books.length} books containing "Patterns"`);
      } else {
        logFail('search_q=Patterns did not match expected books', res.body);
      }
    }
    {
      const res = await request('GET', '/books?search_q=NonExistentTitleXYZ');
      if (res.status === 200 && res.body.books.length === 0 && res.body.total === 0) {
        logPass('GET /books?search_q=NonExistentTitleXYZ returns 200 OK with empty books array');
      } else {
        logFail('search_q for non-existent title did not return empty array', res.body);
      }
    }

    // 4. GET /books?order_by=...&order=... (Sorting)
    console.log(`\n\x1b[36m[Test Group 4] GET /books Sorting (order_by & order ASC/DESC)\x1b[0m`);
    {
      const res = await request('GET', '/books?order_by=price&order=DESC&limit=4');
      const prices = res.body.books.map(b => b.price);
      const isSortedDesc = prices.every((p, i) => i === 0 || prices[i - 1] >= p);
      if (res.status === 200 && isSortedDesc && prices[0] === 85.00) {
        logPass(`GET /books?order_by=price&order=DESC sorts descending correctly: [${prices.join(', ')}]`);
      } else {
        logFail('Sorting by price DESC failed', prices);
      }
    }
    {
      const res = await request('GET', '/books?order_by=price&order=ASC&limit=4');
      const prices = res.body.books.map(b => b.price);
      const isSortedAsc = prices.every((p, i) => i === 0 || prices[i - 1] <= p);
      if (res.status === 200 && isSortedAsc && prices[0] === 24.50) {
        logPass(`GET /books?order_by=price&order=ASC sorts ascending correctly: [${prices.join(', ')}]`);
      } else {
        logFail('Sorting by price ASC failed', prices);
      }
    }
    {
      const res = await request('GET', '/books?order_by=title&order=ASC&limit=3');
      const titles = res.body.books.map(b => b.title);
      const isSortedAlpha = titles.every((t, i) => i === 0 || titles[i - 1].localeCompare(t) <= 0);
      if (res.status === 200 && isSortedAlpha) {
        logPass(`GET /books?order_by=title&order=ASC sorts alphabetically correctly`);
      } else {
        logFail('Sorting by title ASC failed', titles);
      }
    }

    // 5. GET /books?limit=...&offset=... (Pagination)
    console.log(`\n\x1b[36m[Test Group 5] GET /books Pagination (limit & offset)\x1b[0m`);
    {
      const resPage1 = await request('GET', '/books?limit=2&offset=0&order_by=id&order=ASC');
      const resPage2 = await request('GET', '/books?limit=2&offset=2&order_by=id&order=ASC');
      if (resPage1.status === 200 && resPage1.body.books.length === 2 &&
          resPage2.status === 200 && resPage2.body.books.length === 2 &&
          resPage1.body.books[0].id === 1 && resPage1.body.books[1].id === 2 &&
          resPage2.body.books[0].id === 3 && resPage2.body.books[1].id === 4) {
        logPass('GET /books pagination correctly pages records with limit and offset');
      } else {
        logFail('Pagination failed', { p1: resPage1.body, p2: resPage2.body });
      }
    }

    // 6. Price-range filtering (min_price, max_price, BETWEEN)
    console.log(`\n\x1b[36m[Test Group 6] Price-Range Filters (min_price, max_price, BETWEEN)\x1b[0m`);
    {
      const res = await request('GET', '/books?min_price=30&max_price=50');
      const allInRange = res.body.books.every(b => b.price >= 30 && b.price <= 50);
      if (res.status === 200 && res.body.books.length > 0 && allInRange) {
        logPass(`GET /books?min_price=30&max_price=50 filters books within range (${res.body.books.length} found)`);
      } else {
        logFail('min_price and max_price BETWEEN filter failed', res.body);
      }
    }
    {
      const res = await request('GET', '/books?min_price=70');
      const allMin = res.body.books.every(b => b.price >= 70);
      if (res.status === 200 && res.body.books.length > 0 && allMin) {
        logPass(`GET /books?min_price=70 filters books >= 70 (${res.body.books.length} found)`);
      } else {
        logFail('min_price filter failed', res.body);
      }
    }
    {
      const res = await request('GET', '/books?max_price=30');
      const allMax = res.body.books.every(b => b.price <= 30);
      if (res.status === 200 && res.body.books.length > 0 && allMax) {
        logPass(`GET /books?max_price=30 filters books <= 30 (${res.body.books.length} found)`);
      } else {
        logFail('max_price filter failed', res.body);
      }
    }

    // 7. Validation & Error Handling on Query Parameters (400 Bad Request)
    console.log(`\n\x1b[36m[Test Group 7] Query Parameter Validation Failures (400 Bad Request)\x1b[0m`);
    {
      const res = await request('GET', '/books?order_by=hacked_column');
      if (res.status === 400 && res.body.message && res.body.message.includes('Invalid order_by')) {
        logPass('GET /books?order_by=hacked_column returns 400 with { message } preventing SQL injection');
      } else {
        logFail('Did not reject invalid order_by column', res.body);
      }
    }
    {
      const res = await request('GET', '/books?order=DIAGONAL');
      if (res.status === 400 && res.body.message && res.body.message.includes('Invalid order direction')) {
        logPass('GET /books?order=DIAGONAL returns 400 for invalid order direction');
      } else {
        logFail('Did not reject invalid order direction', res.body);
      }
    }
    {
      const res = await request('GET', '/books?min_price=100&max_price=20');
      if (res.status === 400 && res.body.message && res.body.message.includes('greater than')) {
        logPass('GET /books?min_price=100&max_price=20 returns 400 when min_price > max_price');
      } else {
        logFail('Did not reject min_price > max_price', res.body);
      }
    }
    {
      const res = await request('GET', '/books?limit=-5');
      if (res.status === 400 && res.body.message && res.body.message.includes('positive integer')) {
        logPass('GET /books?limit=-5 returns 400 for negative limit');
      } else {
        logFail('Did not reject negative limit', res.body);
      }
    }
    {
      const res = await request('GET', '/books?offset=-1');
      if (res.status === 400 && res.body.message && res.body.message.includes('non-negative integer')) {
        logPass('GET /books?offset=-1 returns 400 for negative offset');
      } else {
        logFail('Did not reject negative offset', res.body);
      }
    }

    // 8. GET /books/:id (Success and 404 Failure)
    console.log(`\n\x1b[36m[Test Group 8] GET /books/:id (Single Book & 404 / 400)\x1b[0m`);
    {
      const res = await request('GET', '/books/1');
      if (res.status === 200 && res.body.id === 1 && res.body.title === 'The Pragmatic Programmer') {
        logPass('GET /books/1 returns 200 OK with correct book details');
      } else {
        logFail('Failed to retrieve book by ID', res.body);
      }
    }
    {
      const res = await request('GET', '/books/99999');
      if (res.status === 404 && res.body.message && res.body.message.includes('not found')) {
        logPass('GET /books/99999 returns 404 Not Found with consistent { message }');
      } else {
        logFail('Non-existent ID did not return 404', res.body);
      }
    }
    {
      const res = await request('GET', '/books/invalid_string');
      if (res.status === 400 && res.body.message && res.body.message.includes('positive integer')) {
        logPass('GET /books/invalid_string returns 400 Bad Request for non-integer ID');
      } else {
        logFail('Non-integer ID did not return 400', res.body);
      }
    }

    // 9. POST /books - Validation & 201 Created
    console.log(`\n\x1b[36m[Test Group 9] POST /books (Validation & 201 Created)\x1b[0m`);
    let createdBookId = null;
    {
      const validBook = {
        title: 'Building Microservices',
        author: 'Sam Newman',
        price: 49.99
      };
      const res = await request('POST', '/books', validBook);
      if (res.status === 201 && res.body.book && res.body.book.title === validBook.title) {
        createdBookId = res.body.book.id;
        logPass(`POST /books returns 201 Created and newly created record (ID: ${createdBookId})`);
      } else {
        logFail('POST /books failed to create book', res.body);
      }
    }
    {
      // Missing title
      const res = await request('POST', '/books', { author: 'Sam Newman', price: 49.99 });
      if (res.status === 400 && res.body.message && res.body.message.toLowerCase().includes('title')) {
        logPass('POST /books rejects missing title with 400 Bad Request');
      } else {
        logFail('Did not reject missing title', res.body);
      }
    }
    {
      // Missing author
      const res = await request('POST', '/books', { title: 'Some Title', price: 49.99 });
      if (res.status === 400 && res.body.message && res.body.message.toLowerCase().includes('author')) {
        logPass('POST /books rejects missing author with 400 Bad Request');
      } else {
        logFail('Did not reject missing author', res.body);
      }
    }
    {
      // Missing price
      const res = await request('POST', '/books', { title: 'Some Title', author: 'Some Author' });
      if (res.status === 400 && res.body.message && res.body.message.toLowerCase().includes('price')) {
        logPass('POST /books rejects missing price with 400 Bad Request');
      } else {
        logFail('Did not reject missing price', res.body);
      }
    }
    {
      // Non-numeric price
      const res = await request('POST', '/books', { title: 'Some Title', author: 'Some Author', price: 'free' });
      if (res.status === 400 && res.body.message && res.body.message.toLowerCase().includes('price')) {
        logPass('POST /books rejects non-numeric price ("free") with 400 Bad Request');
      } else {
        logFail('Did not reject non-numeric price', res.body);
      }
    }

    // 10. PUT /books/:id - Update existing book & 404 on missing
    console.log(`\n\x1b[36m[Test Group 10] PUT /books/:id (Update & 200 OK / 404)\x1b[0m`);
    {
      const updatePayload = {
        title: 'Building Microservices: Designing Fine-Grained Systems (2nd Ed)',
        author: 'Sam Newman',
        price: 54.50
      };
      const res = await request('PUT', `/books/${createdBookId}`, updatePayload);
      if (res.status === 200 && res.body.book && res.body.book.title === updatePayload.title && res.body.book.price === 54.50) {
        logPass(`PUT /books/${createdBookId} returns 200 OK with updated record`);
      } else {
        logFail('PUT /books/:id failed to update', res.body);
      }
    }
    {
      // PUT non-existent ID
      const res = await request('PUT', '/books/99999', { title: 'Ghost', author: 'Ghost', price: 20 });
      if (res.status === 404 && res.body.message && res.body.message.includes('not found')) {
        logPass('PUT /books/99999 returns 404 Not Found for non-existent record');
      } else {
        logFail('Did not return 404 for updating non-existent ID', res.body);
      }
    }

    // 11. DELETE /books/:id - Delete book & 404 on missing
    console.log(`\n\x1b[36m[Test Group 11] DELETE /books/:id (Delete & 200 OK / 404)\x1b[0m`);
    {
      const res = await request('DELETE', `/books/${createdBookId}`);
      if (res.status === 200 && res.body.message && res.body.message.includes('deleted')) {
        logPass(`DELETE /books/${createdBookId} returns 200 OK with success message`);
      } else {
        logFail('DELETE /books/:id failed', res.body);
      }
    }
    {
      // Confirm deletion with GET
      const res = await request('GET', `/books/${createdBookId}`);
      if (res.status === 404) {
        logPass(`Confirmed book ${createdBookId} returns 404 Not Found after deletion`);
      } else {
        logFail(`Book ${createdBookId} was still found after deletion`, res.body);
      }
    }
    {
      // DELETE non-existent ID
      const res = await request('DELETE', '/books/99999');
      if (res.status === 404 && res.body.message && res.body.message.includes('not found')) {
        logPass('DELETE /books/99999 returns 404 Not Found for non-existent record');
      } else {
        logFail('Did not return 404 for deleting non-existent ID', res.body);
      }
    }

    // 12. Catch-all unknown routes
    console.log(`\n\x1b[36m[Test Group 12] Unknown Routes (Consistent 404 Response)\x1b[0m`);
    {
      const res = await request('GET', '/api/undefined-endpoint');
      if (res.status === 404 && res.body.message && res.body.message.includes('Route not found')) {
        logPass('GET /api/undefined-endpoint returns 404 Not Found with consistent { message }');
      } else {
        logFail('Catch-all 404 failed', res.body);
      }
    }

  } finally {
    server.close();
  }

  console.log(`\n===========================================================`);
  console.log(` Test Suite Results:`);
  console.log(` Passed: \x1b[32m${passedCount}\x1b[0m`);
  console.log(` Failed: \x1b[31m${failedCount}\x1b[0m`);
  console.log(` Score:  ${((passedCount / (passedCount + failedCount)) * 100).toFixed(1)}%`);
  console.log(`===========================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
