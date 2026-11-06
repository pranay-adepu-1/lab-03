# Lab 03: REST API, Query Parameters, Validation, and Debugging

**Student Name:** Adepu Pranay Kumar  
**Registration Number:** 252U1R1002  
**Section:** CSE-2A(S-15)  
**Course:** B.Tech CSE (Backend Development Fundamentals - Year II Term II)  
**Institution:** Aurora University  
**Faculty:** MR.sai shiva teja  

---

## 📌 Project Overview

This repository contains the complete implementation for **Lab 3: REST API, query parameters, validation, and debugging** of the Backend Development Fundamentals course at Aurora University.

The project transforms basic routes into an enterprise-grade RESTful API built on **Node.js**, **Express**, and **SQLite**, incorporating:
- RESTful noun-based endpoint architecture (`/books`).
- Rich search and filtering capabilities (`search_q` partial match with SQL `LIKE`).
- Dynamic sorting (`order_by` and `order` ASC/DESC) protected by whitelisting.
- Pagination (`limit` and `offset`) with default and validated boundaries.
- Price-range filtering (`min_price`, `max_price`, and SQL `BETWEEN`).
- Strict request validation with HTTP `400 Bad Request` and clear error messaging.
- Proper HTTP response codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
- Fully parameterized queries to ensure complete immunity against SQL injection.
- Complete Postman test collection with automated assertions.
- Comprehensive automated test runner with 100% test pass rate.
- Solutions to the 4 faculty debugging exercises (`EADDRINUSE`, wrong import path, table name typo, and missing await).

---

## 🏗️ Project Structure

```text
lab 03/
├── .env.example                                      # Environment variable template
├── .gitignore                                        # Excludes node_modules, .env, and local DB files
├── database.js                                       # SQLite connection & query wrapper (parameterized)
├── package.json                                      # Project metadata, dependencies, student author
├── server.js                                         # Express app initialization, middleware, root endpoint
├── seed.js                                           # Database initialization and sample data seeder
├── test.js                                           # Automated test runner verifying all 31 test scenarios
├── routes/
│   └── books.js                                      # RESTful router for /books CRUD & query operations
├── debugging/
│   └── DEBUGGING_GUIDE.md                            # Comprehensive analysis of 4 debugging bugs & fixes
├── postman/
│   └── Lab_03_REST_API.postman_collection.json       # Ready-to-import Postman v2.1 collection
└── BDF_Lab_03_REST_API_query_parameters_validation_debugging.docx # Lab manual
```

---

## 📡 REST API Specification

### Base URL: `http://localhost:3000`

| Method | Endpoint | Description | Request Body | Success Code | Error Codes |
|---|---|---|---|---|---|
| `GET` | `/` | API status & student metadata | None | `200 OK` | `500` |
| `GET` | `/books` | List books with search, sort, filter & pagination | None | `200 OK` | `400`, `500` |
| `GET` | `/books/:id` | Retrieve single book by primary ID | None | `200 OK` | `400`, `404`, `500` |
| `POST` | `/books` | Create a new book | `{ title, author, price }` | `201 Created` | `400`, `500` |
| `PUT` | `/books/:id` | Update an existing book | `{ title, author, price }` | `200 OK` | `400`, `404`, `500` |
| `DELETE`| `/books/:id` | Delete a book by ID | None | `200 OK` | `400`, `404`, `500` |

---

## 🔍 Query Parameters for `GET /books`

| Parameter | Type | Default | Description | Example |
|---|---|---|---|---|
| `search_q` | String | `""` (all) | Case-insensitive partial title search (`LIKE %...%`) | `/books?search_q=Clean` |
| `order_by` | String | `id` | Column to sort by: `id`, `title`, `author`, `price`, `created_at` | `/books?order_by=price` |
| `order` | String | `ASC` | Sort direction: `ASC` or `DESC` | `/books?order=DESC` |
| `limit` | Integer | `10` | Maximum number of records to return (must be > 0) | `/books?limit=5` |
| `offset` | Integer | `0` | Number of initial records to skip (must be ≥ 0) | `/books?offset=2` |
| `min_price`| Float | Optional | Lower bound for price filter (`price >= ?`) | `/books?min_price=30` |
| `max_price`| Float | Optional | Upper bound for price filter (`price <= ?`) | `/books?max_price=80` |

> When both `min_price` and `max_price` are supplied, the query executes `price BETWEEN ? AND ?`.

---

## 🛡️ Validation & Error Response Format

All error responses strictly adhere to the unified format:
```json
{
  "message": "Clear description of error"
}
```

### Validation Rules:
1. **POST /books Validation**:
   - `title`: Must be present, non-empty string. If invalid → `400 Bad Request`: `{"message": "Title is required and must be a non-empty string"}`.
   - `author`: Must be present, non-empty string. If invalid → `400 Bad Request`: `{"message": "Author is required and must be a non-empty string"}`.
   - `price`: Must be a valid non-negative number. If missing or non-numeric → `400 Bad Request`: `{"message": "Price is required and must be a non-negative number"}`.
2. **Query Parameters Validation**:
   - Disallowed `order_by` column → `400 Bad Request`.
   - Disallowed `order` direction → `400 Bad Request`.
   - `min_price > max_price` → `400 Bad Request`: `{"message": "min_price cannot be greater than max_price"}`.
   - Non-positive `limit` or negative `offset` → `400 Bad Request`.
3. **ID Validation**:
   - Non-numeric or non-positive `:id` → `400 Bad Request`.
   - Non-existent `:id` on GET, PUT, DELETE → `404 Not Found`.

---

## 🔒 Security Best Practices Implemented

1. **Parameterised Queries**: Every user input is bound using parameter placeholders (`?`). String concatenation is strictly prohibited, neutralizing SQL injection attacks.
2. **Column Whitelisting**: Sort fields (`order_by`) are matched against a fixed dictionary of allowed table columns before query construction.
3. **Isolated Secrets**: Configuration values (`PORT`, `DB_FILE`) reside in `.env`, excluded from git tracking via `.gitignore`.
4. **No Plaintext Passwords**: Password management rules adhered to across application boundaries.

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js** (v18 or higher; tested on v24)
- **npm** or **pnpm**

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
*(Default settings use port 3000 and SQLite database `database.sqlite`)*

### 4. Seed Database
Populate the database with sample computer science books:
```bash
npm run seed
```

### 5. Start Server
Run the production server:
```bash
npm start
```
Or start in development mode with live watch:
```bash
npm run dev
```
The server will be accessible at `http://localhost:3000`.

### 6. Run Automated Test Suite
Execute the 31-test automated suite covering all success and failure conditions:
```bash
npm test
```

---

## 🧪 Automated Test Suite Results

The automated test runner (`test.js`) executes 31 end-to-end tests:

```text
===========================================================
 Aurora University - Backend Development Fundamentals (Term II)
 Lab 3: REST API, query parameters, validation, debugging
 Student: Adepu Pranay Kumar | Reg: 252U1R1002
 Section: CSE-2A(S-15) | Faculty: MR.sai shiva teja
===========================================================

[Database] Initialized with 10 sample books.
[Test Group 1] Root & Student Details Endpoint (GET /)
  ✔ PASS: GET / returns 200 OK with verified student metadata and API route map

[Test Group 2] GET /books - Default Query Parameters
  ✔ PASS: GET /books returns 200 OK with default limit (10), offset (0), and total count (10)

[Test Group 3] GET /books?search_q= (Partial LIKE search on title)
  ✔ PASS: GET /books?search_q=Clean matches "Clean Code" correctly with LIKE
  ✔ PASS: GET /books?search_q=Patterns matched 2 books containing "Patterns"
  ✔ PASS: GET /books?search_q=NonExistentTitleXYZ returns 200 OK with empty books array

[Test Group 4] GET /books Sorting (order_by & order ASC/DESC)
  ✔ PASS: GET /books?order_by=price&order=DESC sorts descending correctly: [85, 78.5, 72, 65]
  ✔ PASS: GET /books?order_by=price&order=ASC sorts ascending correctly: [24.5, 29.99, 38.5, 42]
  ✔ PASS: GET /books?order_by=title&order=ASC sorts alphabetically correctly

[Test Group 5] GET /books Pagination (limit & offset)
  ✔ PASS: GET /books pagination correctly pages records with limit and offset

[Test Group 6] Price-Range Filters (min_price, max_price, BETWEEN)
  ✔ PASS: GET /books?min_price=30&max_price=50 filters books within range (3 found)
  ✔ PASS: GET /books?min_price=70 filters books >= 70 (3 found)
  ✔ PASS: GET /books?max_price=30 filters books <= 30 (2 found)

[Test Group 7] Query Parameter Validation Failures (400 Bad Request)
  ✔ PASS: GET /books?order_by=hacked_column returns 400 with { message } preventing SQL injection
  ✔ PASS: GET /books?order=DIAGONAL returns 400 for invalid order direction
  ✔ PASS: GET /books?min_price=100&max_price=20 returns 400 when min_price > max_price
  ✔ PASS: GET /books?limit=-5 returns 400 for negative limit
  ✔ PASS: GET /books?offset=-1 returns 400 for negative offset

[Test Group 8] GET /books/:id (Single Book & 404 / 400)
  ✔ PASS: GET /books/1 returns 200 OK with correct book details
  ✔ PASS: GET /books/99999 returns 404 Not Found with consistent { message }
  ✔ PASS: GET /books/invalid_string returns 400 Bad Request for non-integer ID

[Test Group 9] POST /books (Validation & 201 Created)
  ✔ PASS: POST /books returns 201 Created and newly created record (ID: 11)
  ✔ PASS: POST /books rejects missing title with 400 Bad Request
  ✔ PASS: POST /books rejects missing author with 400 Bad Request
  ✔ PASS: POST /books rejects missing price with 400 Bad Request
  ✔ PASS: POST /books rejects non-numeric price ("free") with 400 Bad Request

[Test Group 10] PUT /books/:id (Update & 200 OK / 404)
  ✔ PASS: PUT /books/11 returns 200 OK with updated record
  ✔ PASS: PUT /books/99999 returns 404 Not Found for non-existent record

[Test Group 11] DELETE /books/:id (Delete & 200 OK / 404)
  ✔ PASS: DELETE /books/11 returns 200 OK with success message
  ✔ PASS: Confirmed book 11 returns 404 Not Found after deletion
  ✔ PASS: DELETE /books/99999 returns 404 Not Found for non-existent record

[Test Group 12] Unknown Routes (Consistent 404 Response)
  ✔ PASS: GET /api/undefined-endpoint returns 404 Not Found with consistent { message }

===========================================================
 Test Suite Results:
 Passed: 31
 Failed: 0
 Score:  100.0%
===========================================================
```

---

## 📬 Postman Test Collection

The deliverable includes a pre-configured Postman collection ready to import:
- **Location:** `postman/Lab_03_REST_API.postman_collection.json`
- **Specification:** Postman Schema v2.1.0
- **Contents:**
  1. Student Info & API Root (`GET /`)
  2. `GET /books` Success Scenarios (Default, `search_q`, `order_by`, `order`, `limit`, `offset`, `min_price`, `max_price`)
  3. `GET /books` Failure Scenarios (`400 Bad Request` validation tests)
  4. `GET /books/:id` (`200 OK` and `404 Not Found`)
  5. `POST /books` (`201 Created` and `400 Bad Request` missing/invalid fields)
  6. `PUT /books/:id` (`200 OK` update and `404 Not Found`)
  7. `DELETE /books/:id` (`200 OK` deletion and `404 Not Found`)
  8. Unknown Route Catch-All (`404 Not Found`)

### How to Import & Run in Postman:
1. Open Postman.
2. Click **Import** (top-left button).
3. Select `postman/Lab_03_REST_API.postman_collection.json`.
4. Ensure server is running (`npm start`).
5. Click **Run Collection** to automatically execute all assertions.

---

## 🛠️ Debugging Exercise Summary

| Bug | Symptom / Error | Root Cause | Solution |
|---|---|---|---|
| **1. Port Conflict** | `Error: listen EADDRINUSE :::3000` | Port 3000 already occupied by zombie process or another service | Use configurable `process.env.PORT`, add graceful error handler, or kill PID via `taskkill /PID <PID> /F` |
| **2. Wrong Import Path** | `Cannot find module './database'` in `routes/books.js` | Modular router is in a subdirectory; relative path requires `../database` | Change `./database` to `../database` in `routes/books.js` |
| **3. Table-Name Typo** | `SqliteError: no such table: book` | Query targeted singular `book` while table DDL defined `books` | Standardize all queries to table name `books` |
| **4. Missing Await** | `res.json(books)` returns empty object `{}` | Database query is asynchronous; without `await`, pending Promise is returned | Add `await` before asynchronous calls: `const books = await db.all(...)` |

*(Detailed guide with code diffs available in [`debugging/DEBUGGING_GUIDE.md`](debugging/DEBUGGING_GUIDE.md))*

---

## 🎓 Viva Questions & Answers

### 1. Query parameter vs Path parameter?
- **Path Parameter (`/books/:id`):** Used to identify a **specific resource** hierarchically. It is an essential component of the resource's unique URL identifier (e.g. `/books/5` refers specifically to the book with ID 5).
- **Query Parameter (`/books?search_q=Clean&order_by=price`):** Used to **filter, sort, search, or paginate** a collection. Query parameters are optional, follow a `?` delimiter with key-value pairs separated by `&`, and do not alter the identity of the resource being requested.

### 2. What does stateless mean in REST?
- **Statelessness** means that every HTTP request from the client to the server must contain **all the information necessary** to understand and process the request.
- The server does **not** store any client session context between requests on the server side.
- **Benefits:** High scalability (requests can be handled by any server instance in a cluster), simplified server architecture, and improved reliability/recovery from failure.

### 3. Which status code for bad input vs a missing record?
- **Bad Input → `400 Bad Request`:** Used when the client sends malformed JSON, missing mandatory fields (e.g., missing title or author), non-numeric values for numeric fields (e.g., string price), or out-of-range parameters (`min_price > max_price`).
- **Missing Record → `404 Not Found`:** Used when the client makes a valid request for a resource that does not exist in the database (e.g., `GET /books/99999` or updating/deleting an ID that does not exist).

---

## 📋 Evaluation Checklist

- [x] Endpoints named as nouns (`/books`) using standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
- [x] Query parameters implemented for `GET /books`: `search_q` (LIKE partial match), `order_by`, `order`, `limit`, `offset`.
- [x] Price-range filters implemented (`min_price`, `max_price`, and `BETWEEN`).
- [x] POST body validation rejects missing title, author, or non-numeric price with `400` and clear JSON message.
- [x] Returns `201` on create, `200` on update/delete, `404` when ID does not exist.
- [x] Consistent JSON error response format `{ "message": "..." }`.
- [x] Debugging exercise covered and documented (port conflict, wrong import path, table name typo, missing await).
- [x] Parameterized SQL queries implemented throughout (immune to SQL injection).
- [x] `.env` isolated, `node_modules` ignored in `.gitignore`.
- [x] Postman collection deliverable prepared with test scripts.
- [x] Viva questions answered in detail.
- [x] Student details accurately included across repository files.
