/**
 * Student Name: Adepu Pranay Kumar
 * Registration Number: 252U1R1002
 * Section: CSE-2A(S-15)
 * Course: B.Tech CSE (Backend Development Fundamentals - Year II Term II)
 * Institution: Aurora University
 * Faculty: MR.sai shiva teja
 * 
 * Lab 3: REST API, query parameters, validation, and debugging
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

// Standard Middlewares
app.use(cors());
app.use(express.json());

// Student Details & API Info endpoint (Root)
app.get('/', (req, res) => {
  res.status(200).json({
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
  });
});

// Mount /books router
app.use('/books', booksRouter);

// Catch-all 404 handler for unknown routes with consistent { message: "..." }
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

// Centralized error handler with consistent { message: "..." }
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Malformed JSON payload in request body'
    });
  }
  return res.status(500).json({
    message: 'Internal server error'
  });
});

// Start Server and initialize Database
async function startServer() {
  try {
    await db.initDatabase();
    
    const HOST = '0.0.0.0';
    const server = app.listen(PORT, HOST, () => {
      console.log(`====================================================`);
      console.log(` Aurora University - Backend Development Fundamentals `);
      console.log(` Student: Adepu Pranay Kumar (Reg: 252U1R1002) `);
      console.log(` Section: CSE-2A(S-15) | Faculty: MR.sai shiva teja `);
      console.log(` Server is running on: http://${HOST}:${PORT} `);
      console.log(`====================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[ERROR] Port ${PORT} is already in use (EADDRINUSE).`);
        console.error(`Fix: Choose a different port in .env (e.g. PORT=3001) or terminate the process on port ${PORT}.`);
      } else {
        console.error('[ERROR] Server startup failed:', err);
      }
      process.exit(1);
    });

    return server;
  } catch (err) {
    console.error('Failed to initialize database or start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

