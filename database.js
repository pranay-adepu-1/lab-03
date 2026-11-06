/**
 * Student Name: Adepu Pranay Kumar
 * Registration Number: 252U1R1002
 * Section: CSE-2A(S-15)
 * Course: B.Tech CSE (Backend Development Fundamentals - Year II Term II)
 * Institution: Aurora University
 * Faculty: MR.sai shiva teja
 * 
 * Database connection and query wrapper using SQLite
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
require('dotenv').config();

const DB_FILE = process.env.DB_FILE || 'database.sqlite';
const dbPath = path.resolve(__dirname, DB_FILE);

let dbInstance = null;

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath);
  }
  return dbInstance;
}

// Async wrapper functions to support promise-based async/await syntax
const db = {
  /**
   * Execute DDL or script
   */
  async exec(sql) {
    const database = getDatabase();
    return database.exec(sql);
  },

  /**
   * Run a query expecting multiple rows (SELECT)
   * Parameterised query to prevent SQL injection
   */
  async all(sql, params = []) {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    const paramArray = Array.isArray(params) ? params : [params];
    const rows = stmt.all(...paramArray);
    // Convert [Object: null prototype] to plain JavaScript objects
    return rows.map(row => ({ ...row }));
  },

  /**
   * Run a query expecting a single row (SELECT ... LIMIT 1 / by ID)
   * Parameterised query to prevent SQL injection
   */
  async get(sql, params = []) {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    const paramArray = Array.isArray(params) ? params : [params];
    const row = stmt.get(...paramArray);
    return row ? { ...row } : undefined;
  },

  /**
   * Run an INSERT, UPDATE, or DELETE statement
   * Returns { changes: number, lastInsertRowid: number }
   * Parameterised query to prevent SQL injection
   */
  async run(sql, params = []) {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    const paramArray = Array.isArray(params) ? params : [params];
    const result = stmt.run(...paramArray);
    return {
      changes: result.changes,
      lastID: Number(result.lastInsertRowid)
    };
  },

  /**
   * Initialize table and seed sample data if table is empty
   */
  async initDatabase() {
    const database = getDatabase();
    
    // Create books table with schema constraints
    database.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if books table is empty
    const checkStmt = database.prepare('SELECT COUNT(*) as count FROM books');
    const { count } = checkStmt.get();

    if (count === 0) {
      const sampleBooks = [
        ['The Pragmatic Programmer', 'David Thomas & Andrew Hunt', 45.00],
        ['Clean Code', 'Robert C. Martin', 38.50],
        ['Introduction to Algorithms', 'Thomas H. Cormen', 85.00],
        ['Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 54.00],
        ['JavaScript: The Good Parts', 'Douglas Crockford', 29.99],
        ['You Don\'t Know JS', 'Kyle Simpson', 24.50],
        ['Node.js Design Patterns', 'Mario Casciaro', 42.00],
        ['Database System Concepts', 'Abraham Silberschatz', 78.50],
        ['Modern Operating Systems', 'Andrew S. Tanenbaum', 65.00],
        ['Computer Networking: A Top-Down Approach', 'James Kurose', 72.00]
      ];

      const insertStmt = database.prepare('INSERT INTO books (title, author, price) VALUES (?, ?, ?)');
      for (const book of sampleBooks) {
        insertStmt.run(...book);
      }
      console.log(`[Database] Initialized with ${sampleBooks.length} sample books.`);
    }
  }
};

module.exports = db;

