/**
 * Student Name: Adepu Pranay Kumar
 * Registration Number: 252U1R1002
 * Section: CSE-2A(S-15)
 * Course: B.Tech CSE (Backend Development Fundamentals - Year II Term II)
 * Institution: Aurora University
 * Faculty: MR.sai shiva teja
 * 
 * Standalone seed script to reset and populate the database
 */

const db = require('./database');

async function seed() {
  console.log('Resetting and seeding books table...');

  await db.exec('DROP TABLE IF EXISTS books;');

  await db.exec(`
    CREATE TABLE books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

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

  for (const book of sampleBooks) {
    await db.run('INSERT INTO books (title, author, price) VALUES (?, ?, ?)', book);
  }

  const rows = await db.all('SELECT * FROM books');
  console.log(`Seeding complete! Inserted ${rows.length} books.`);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

