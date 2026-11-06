# Lab 03 Debugging Exercise Guide

**Student Name:** Adepu Pranay Kumar  
**Registration Number:** 252U1R1002  
**Section:** CSE-2A(S-15)  
**Course:** B.Tech CSE (Backend Development Fundamentals - Year II Term II)  
**Institution:** Aurora University  
**Faculty:** MR.sai shiva teja  

---

## Overview

In Backend Development Fundamentals, debugging runtime, configuration, and architectural issues is a core skill. This document explains the 4 classic backend errors covered in the Lab 03 debugging exercise, detailing their symptoms, root causes, and verified fixes.

---

## 1. Port Conflict (`EADDRINUSE`)

### Symptom & Error Trace
```text
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1904:16)
    at listenInCluster (node:net:1961:12)
    at Server.listen (node:net:2066:7)
    at Function.listen (c:\Users\prana\OneDrive\Desktop\lab 03\node_modules\express\lib\application.js:639:24)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1940:8)
```

### Root Cause
An operating system network socket (port 3000) can only be bound to a single listening process at a time. This happens when:
- A previous Node server instance was not cleanly stopped (running in the background).
- Another service (like another project or React dev server) is occupying port 3000.
- Hardcoding the port number (`app.listen(3000)`) prevents flexibility.

### The Fix
1. **Configurable Environment Variable**: Read port from `process.env.PORT` with a fallback:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```
   If port 3000 is occupied, simply update `.env` to `PORT=3001` or run `PORT=3001 node server.js`.

2. **Graceful Error Listener**:
   ```javascript
   server.on('error', (err) => {
     if (err.code === 'EADDRINUSE') {
       console.error(`[ERROR] Port ${PORT} is already in use (EADDRINUSE).`);
       console.error(`Fix: Change PORT in .env or terminate the occupying process.`);
     }
     process.exit(1);
   });
   ```

3. **Terminating the Occupying Process (Windows)**:
   ```powershell
   # Find the Process ID (PID)
   netstat -ano | findstr :3000
   # Kill the process
   taskkill /PID <PID> /F
   ```

---

## 2. Wrong Import Path

### Symptom & Error Trace
```text
node:internal/modules/cjs/loader:1252
  throw err;
  ^

Error: Cannot find module './database'
Require stack:
- C:\Users\prana\OneDrive\Desktop\lab 03\routes\books.js
- C:\Users\prana\OneDrive\Desktop\lab 03\server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1249:15)
    at defaultResolve (node:internal/modules/cjs/loader:614:26)
```

### Root Cause
When code is refactored from a monolithic `server.js` into subdirectories (such as `routes/books.js`), relative import paths change:
- Inside `server.js` (root): `./database` refers to `lab 03/database.js`.
- Inside `routes/books.js`: `./database` looks for `lab 03/routes/database.js` which does **not** exist.

### The Fix
Update the relative path to navigate up one directory level (`../`):
```javascript
// BROKEN (inside routes/books.js):
const db = require('./database');

// FIXED:
const db = require('../database');
```

---

## 3. Table-Name Typo (`no such table`)

### Symptom & Error Trace
```text
SqliteError: no such table: book
    at DatabaseSync.prepare (node:sqlite:102:18)
    at db.all (C:\Users\prana\OneDrive\Desktop\lab 03\database.js:35:31)
    at C:\Users\prana\OneDrive\Desktop\lab 03\routes\books.js:154:32
```

### Root Cause
REST naming conventions use plural nouns for collections (`/books`), and the SQL schema created the table as `books`:
```sql
CREATE TABLE IF NOT EXISTS books (...);
```
However, a typo in a route query targeted the singular noun `book` or an older table name like `tbl_books`:
```sql
-- BROKEN:
SELECT * FROM book WHERE id = ?
```

### The Fix
Align all SQL statements across all CRUD endpoints to match the exact schema table name (`books`):
```sql
-- FIXED:
SELECT * FROM books WHERE id = ?
```

---

## 4. Missing `await`

### Symptom & Error Trace
**Behavioral Bug:**
- `GET /books` returns an empty JSON `{}` or `{ "books": {} }` instead of the database array.
- In Express: `res.json(books)` sends an unresolved Promise object `{}` because `JSON.stringify(new Promise(...))` serializes to `{}`.
- Unhandled rejections or race conditions where the response finishes before database results return.

### Root Cause
Database queries in modern backend applications are asynchronous (I/O bound). Omitting `await` causes JavaScript to assign the pending Promise rather than its resolved value:
```javascript
// BROKEN:
router.get('/', async (req, res) => {
  const books = db.all('SELECT * FROM books'); // Missing await! Returns Promise { <pending> }
  res.json({ books }); // Serializes pending promise as {}
});
```

### The Fix
Always use `await` when calling asynchronous database operations inside an `async` handler:
```javascript
// FIXED:
router.get('/', async (req, res) => {
  try {
    const books = await db.all('SELECT * FROM books'); // Properly waits for DB result
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
```
