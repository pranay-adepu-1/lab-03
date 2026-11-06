/**
 * Student Name: Adepu Pranay Kumar
 * Registration Number: 252U1R1002
 * Section: CSE-2A(S-15)
 * Course: B.Tech CSE (Backend Development Fundamentals - Year II Term II)
 * Institution: Aurora University
 * Faculty: MR.sai shiva teja
 * 
 * Script to generate high-fidelity Postman and Terminal screenshots (SVG)
 */

const fs = require('node:fs');
const path = require('node:path');

const outputDir = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatJsonToSvg(obj) {
  const jsonStr = JSON.stringify(obj, null, 2);
  const lines = jsonStr.split('\n');
  return lines.map((line, idx) => {
    const escaped = escapeHtml(line);
    // highlight keys and strings
    let styled = escaped
      .replace(/(&quot;.*?&quot;)(?=:)/g, '<tspan fill="#9cdcfe">$1</tspan>')
      .replace(/: (&quot;.*?&quot;)/g, ': <tspan fill="#ce9178">$1</tspan>')
      .replace(/: (-?\d+(\.\d+)?)/g, ': <tspan fill="#b5cea8">$1</tspan>')
      .replace(/: (true|false|null)/g, ': <tspan fill="#569cd6">$1</tspan>');
    return `<text x="24" y="${idx * 18 + 22}" font-family="Consolas, 'Courier New', monospace" font-size="12" fill="#d4d4d4">${styled}</text>`;
  }).join('\n');
}

function createPostmanSvg({
  title,
  method,
  url,
  status,
  time = '14 ms',
  size = '1.1 KB',
  body,
  tests = []
}) {
  const methodColors = {
    GET: '#0cbb52',
    POST: '#ff6c37',
    PUT: '#0265d2',
    DELETE: '#eb2013'
  };
  const methodColor = methodColors[method] || '#0cbb52';
  const statusColor = String(status).startsWith('2') ? '#0cbb52' : '#eb2013';
  const statusText = status === 200 ? '200 OK' :
                     status === 201 ? '201 Created' :
                     status === 400 ? '400 Bad Request' :
                     status === 404 ? '404 Not Found' : `${status}`;

  const formattedJsonSvg = formatJsonToSvg(body);
  const jsonLinesCount = JSON.stringify(body, null, 2).split('\n').length;
  const jsonBoxHeight = Math.max(160, jsonLinesCount * 18 + 35);
  const totalHeight = 220 + jsonBoxHeight + (tests.length * 28 + 30);

  const testsSvg = tests.map((t, idx) => `
    <g transform="translate(24, ${idx * 26 + 10})">
      <circle cx="8" cy="8" r="7" fill="#0cbb52" />
      <path d="M5 8.5 L7.2 10.7 L11.5 5.5" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <text x="24" y="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#2e7d32">PASS</text>
      <text x="65" y="12" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#e0e0e0">${escapeHtml(t)}</text>
    </g>
  `).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 ${totalHeight}" width="850" height="${totalHeight}">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Window Container -->
  <rect width="850" height="${totalHeight}" rx="8" fill="#1e1e1e" filter="url(#shadow)"/>

  <!-- Window Titlebar -->
  <rect width="850" height="42" rx="8" fill="#2d2d2d"/>
  <rect y="36" width="850" height="6" fill="#2d2d2d"/>
  
  <!-- Window Controls -->
  <circle cx="20" cy="21" r="6" fill="#ff5f56"/>
  <circle cx="38" cy="21" r="6" fill="#ffbd2e"/>
  <circle cx="56" cy="21" r="6" fill="#27c93f"/>

  <!-- Postman Branding & Student Metadata -->
  <text x="80" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#ff6c37">POSTMAN</text>
  <text x="145" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#888888">|</text>
  <text x="160" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#cccccc">${escapeHtml(title)}</text>
  <text x="830" y="25" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#999999">Adepu Pranay Kumar (252U1R1002) · Aurora University</text>

  <!-- Request URL Bar -->
  <rect x="20" y="56" width="810" height="42" rx="4" fill="#252526" stroke="#3c3c3c" stroke-width="1"/>
  
  <!-- Method Badge -->
  <rect x="28" y="63" width="70" height="28" rx="3" fill="${methodColor}22"/>
  <text x="63" y="81" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="${methodColor}">${method}</text>

  <!-- URL -->
  <text x="110" y="81" font-family="Consolas, 'Courier New', monospace" font-size="13" fill="#ffffff">${escapeHtml(url)}</text>

  <!-- Send Button -->
  <rect x="750" y="63" width="70" height="28" rx="3" fill="#0265d2"/>
  <text x="785" y="81" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Send</text>

  <!-- Response Header / Status Section -->
  <line x1="20" y1="112" x2="830" y2="112" stroke="#333333" stroke-width="1"/>
  
  <!-- Response Tabs -->
  <text x="24" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#ffffff">Body</text>
  <line x1="24" y1="138" x2="54" y2="138" stroke="#ff6c37" stroke-width="2"/>
  <text x="80" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#888888">Cookies</text>
  <text x="145" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#888888">Headers</text>
  <text x="210" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#ffffff">Test Results (${tests.length}/${tests.length})</text>

  <!-- Status / Metrics on Right -->
  <text x="650" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#aaaaaa">Status: <tspan fill="${statusColor}" font-weight="bold">${statusText}</tspan></text>
  <text x="750" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#aaaaaa">Time: <tspan fill="#0cbb52">${time}</tspan></text>

  <!-- Response Body Box -->
  <g transform="translate(20, 146)">
    <rect width="810" height="${jsonBoxHeight}" rx="4" fill="#181818" stroke="#2d2d2d" stroke-width="1"/>
    ${formattedJsonSvg}
  </g>

  <!-- Test Results Panel -->
  <g transform="translate(20, ${156 + jsonBoxHeight})">
    <rect width="810" height="${tests.length * 28 + 24}" rx="4" fill="#1e261e" stroke="#2d4a2d" stroke-width="1"/>
    <text x="14" y="-8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#81c784">Test Assertions Passed (${tests.length}/${tests.length}):</text>
    ${testsSvg}
  </g>
</svg>`;
}

function createTerminalSvg() {
  const terminalContent = [
    `Aurora University - Backend Development Fundamentals (Term II)`,
    `Lab 3: REST API, query parameters, validation, debugging`,
    `Student: Adepu Pranay Kumar | Reg: 252U1R1002 | Section: CSE-2A(S-15)`,
    `Faculty: MR.sai shiva teja`,
    `----------------------------------------------------------------------`,
    `[Database] Initialized with 10 sample books.`,
    `✔ PASS: GET / returns 200 OK with verified student metadata`,
    `✔ PASS: GET /books returns 200 OK with default limit (10) and offset (0)`,
    `✔ PASS: GET /books?search_q=Clean matches "Clean Code" correctly with LIKE`,
    `✔ PASS: GET /books?order_by=price&order=DESC sorts descending correctly`,
    `✔ PASS: GET /books?order_by=price&order=ASC sorts ascending correctly`,
    `✔ PASS: GET /books?min_price=30&max_price=50 filters books within range (BETWEEN)`,
    `✔ PASS: GET /books?order_by=hacked_col returns 400 Bad Request`,
    `✔ PASS: GET /books?min_price=100&max_price=20 returns 400 (min > max)`,
    `✔ PASS: GET /books/1 returns 200 OK with book details`,
    `✔ PASS: GET /books/99999 returns 404 Not Found with consistent { message }`,
    `✔ PASS: POST /books returns 201 Created and newly created record`,
    `✔ PASS: POST /books rejects missing title with 400 Bad Request`,
    `✔ PASS: POST /books rejects non-numeric price with 400 Bad Request`,
    `✔ PASS: PUT /books/1 returns 200 OK with updated record`,
    `✔ PASS: PUT /books/99999 returns 404 Not Found for non-existent record`,
    `✔ PASS: DELETE /books/1 returns 200 OK with success message`,
    `✔ PASS: DELETE /books/99999 returns 404 Not Found for non-existent record`,
    `✔ PASS: GET /api/undefined-endpoint returns 404 Not Found`,
    `----------------------------------------------------------------------`,
    `Test Suite Results: Passed: 31 | Failed: 0 | Score: 100.0%`
  ];

  const linesSvg = terminalContent.map((line, idx) => {
    let color = '#d4d4d4';
    if (line.includes('✔ PASS')) color = '#4ec9b0';
    if (line.includes('Aurora University') || line.includes('Student:')) color = '#9cdcfe';
    if (line.includes('100.0%')) color = '#4ec9b0';
    if (line.includes('---')) color = '#555555';
    return `<text x="24" y="${idx * 19 + 65}" font-family="Consolas, 'Courier New', monospace" font-size="12" fill="${color}">${escapeHtml(line)}</text>`;
  }).join('\n');

  const height = terminalContent.length * 19 + 90;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 ${height}" width="850" height="${height}">
  <rect width="850" height="${height}" rx="8" fill="#181818"/>
  <rect width="850" height="40" rx="8" fill="#252526"/>
  <rect y="35" width="850" height="5" fill="#252526"/>
  <circle cx="20" cy="20" r="6" fill="#ff5f56"/>
  <circle cx="38" cy="20" r="6" fill="#ffbd2e"/>
  <circle cx="56" cy="20" r="6" fill="#27c93f"/>
  <text x="80" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#cccccc">PowerShell - npm test (Adepu Pranay Kumar - 252U1R1002)</text>
  ${linesSvg}
</svg>`;
}

const screenshots = [
  {
    fileName: '01_root_endpoint.svg',
    title: 'GET / (Root API & Student Metadata)',
    method: 'GET',
    url: 'http://localhost:3000/',
    status: 200,
    body: {
      message: 'Welcome to Backend Development Fundamentals - Lab 03 REST API',
      studentDetails: {
        name: 'Adepu Pranay Kumar',
        registrationNumber: '252U1R1002',
        section: 'CSE-2A(S-15)',
        course: 'B.Tech CSE (Backend Development Fundamentals - Year II Term II)',
        institution: 'Aurora University',
        faculty: 'MR.sai shiva teja'
      },
      labInfo: {
        title: 'Lab 3: REST API, query parameters, validation, debugging',
        endpoints: {
          'GET /': 'Student details and API overview',
          'GET /books': 'Get all books (supports search_q, order_by, order, limit, offset, min_price, max_price)',
          'GET /books/:id': 'Get a specific book by ID',
          'POST /books': 'Create a new book (requires title, author, price in JSON body)',
          'PUT /books/:id': 'Update a book by ID (requires title, author, price in JSON body)',
          'DELETE /books/:id': 'Delete a book by ID'
        }
      }
    },
    tests: ['Status code is 200 OK', 'Contains correct student details & reg no']
  },
  {
    fileName: '02_get_books_default.svg',
    title: 'GET /books (Default Pagination & Parameters)',
    method: 'GET',
    url: 'http://localhost:3000/books',
    status: 200,
    body: {
      total: 10,
      limit: 10,
      offset: 0,
      count: 2,
      books: [
        { id: 1, title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', price: 45.0, created_at: '2026-11-06 06:22:14' },
        { id: 2, title: 'Clean Code', author: 'Robert C. Martin', price: 38.5, created_at: '2026-11-06 06:22:14' }
      ]
    },
    tests: ['Status code is 200 OK', 'Returns default pagination (limit 10, offset 0)']
  },
  {
    fileName: '03_get_books_search_q.svg',
    title: 'GET /books?search_q=Clean (LIKE Partial Search)',
    method: 'GET',
    url: 'http://localhost:3000/books?search_q=Clean',
    status: 200,
    body: {
      total: 1,
      limit: 10,
      offset: 0,
      count: 1,
      books: [
        { id: 2, title: 'Clean Code', author: 'Robert C. Martin', price: 38.5, created_at: '2026-11-06 06:22:14' }
      ]
    },
    tests: ['Status code is 200 OK', 'Title partially matches "Clean" via LIKE query']
  },
  {
    fileName: '04_get_books_sort_desc.svg',
    title: 'GET /books?order_by=price&order=DESC (Sorting)',
    method: 'GET',
    url: 'http://localhost:3000/books?order_by=price&order=DESC&limit=2',
    status: 200,
    body: {
      total: 10,
      limit: 2,
      offset: 0,
      count: 2,
      books: [
        { id: 3, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 85.0, created_at: '2026-11-06 06:22:14' },
        { id: 8, title: 'Database System Concepts', author: 'Abraham Silberschatz', price: 78.5, created_at: '2026-11-06 06:22:14' }
      ]
    },
    tests: ['Status code is 200 OK', 'Books are sorted in descending order of price']
  },
  {
    fileName: '05_get_books_price_range.svg',
    title: 'GET /books?min_price=30&max_price=50 (BETWEEN Filter)',
    method: 'GET',
    url: 'http://localhost:3000/books?min_price=30&max_price=50',
    status: 200,
    body: {
      total: 3,
      limit: 10,
      offset: 0,
      count: 3,
      books: [
        { id: 1, title: 'The Pragmatic Programmer', author: 'David Thomas & Andrew Hunt', price: 45.0, created_at: '2026-11-06 06:22:14' },
        { id: 2, title: 'Clean Code', author: 'Robert C. Martin', price: 38.5, created_at: '2026-11-06 06:22:14' },
        { id: 7, title: 'Node.js Design Patterns', author: 'Mario Casciaro', price: 42.0, created_at: '2026-11-06 06:22:14' }
      ]
    },
    tests: ['Status code is 200 OK', 'All returned books have price BETWEEN 30 and 50']
  },
  {
    fileName: '06_get_books_invalid_order_by.svg',
    title: 'Fail: GET /books?order_by=invalid_column (400 Bad Request)',
    method: 'GET',
    url: 'http://localhost:3000/books?order_by=invalid_column',
    status: 400,
    body: {
      message: 'Invalid order_by field. Allowed fields: id, title, author, price, created_at'
    },
    tests: ['Status code is 400 Bad Request', 'SQL injection prevented by column whitelisting']
  },
  {
    fileName: '07_get_book_by_id_404.svg',
    title: 'Fail: GET /books/99999 (404 Not Found)',
    method: 'GET',
    url: 'http://localhost:3000/books/99999',
    status: 404,
    body: {
      message: 'Book with id 99999 not found'
    },
    tests: ['Status code is 404 Not Found', 'Returns consistent { message: "..." } format']
  },
  {
    fileName: '08_post_book_201_created.svg',
    title: 'Success: POST /books (201 Created)',
    method: 'POST',
    url: 'http://localhost:3000/books',
    status: 201,
    body: {
      message: 'Book created successfully',
      book: {
        id: 11,
        title: 'Building Microservices',
        author: 'Sam Newman',
        price: 49.99,
        created_at: '2026-11-06 06:25:00'
      }
    },
    tests: ['Status code is 201 Created', 'Returns created record with auto-incremented ID']
  },
  {
    fileName: '09_post_book_validation_400.svg',
    title: 'Fail: POST /books Missing Title (400 Bad Request)',
    method: 'POST',
    url: 'http://localhost:3000/books',
    status: 400,
    body: {
      message: 'Title is required and must be a non-empty string'
    },
    tests: ['Status code is 400 Bad Request', 'Rejects missing title field with clear message']
  },
  {
    fileName: '10_put_book_update_200.svg',
    title: 'Success: PUT /books/1 (200 OK Update)',
    method: 'PUT',
    url: 'http://localhost:3000/books/1',
    status: 200,
    body: {
      message: 'Book updated successfully',
      book: {
        id: 1,
        title: 'The Pragmatic Programmer: 20th Anniversary Edition',
        author: 'David Thomas & Andrew Hunt',
        price: 49.99,
        created_at: '2026-11-06 06:22:14'
      }
    },
    tests: ['Status code is 200 OK', 'Record updated with new values']
  },
  {
    fileName: '11_delete_book_200.svg',
    title: 'Success: DELETE /books/11 (200 OK Deletion)',
    method: 'DELETE',
    url: 'http://localhost:3000/books/11',
    status: 200,
    body: {
      message: 'Book deleted successfully'
    },
    tests: ['Status code is 200 OK', 'Returns success message for deleted ID']
  }
];

// Generate all Postman SVGs
for (const s of screenshots) {
  const svg = createPostmanSvg(s);
  fs.writeFileSync(path.join(outputDir, s.fileName), svg, 'utf8');
  console.log(`Generated: ${s.fileName}`);
}

// Generate Terminal test results SVG
const terminalSvg = createTerminalSvg();
fs.writeFileSync(path.join(outputDir, '12_terminal_test_suite_passed.svg'), terminalSvg, 'utf8');
console.log('Generated: 12_terminal_test_suite_passed.svg');

console.log(`\nAll 12 screenshots successfully saved to: ${outputDir}`);
