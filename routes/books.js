/**
 * Student Name: Adepu Pranay Kumar
 * Registration Number: 252U1R1002
 * Section: CSE-2A(S-15)
 * Course: B.Tech CSE (Backend Development Fundamentals - Year II Term II)
 * Institution: Aurora University
 * Faculty: MR.sai shiva teja
 * 
 * Routes for /books endpoint
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

/**
 * Validation Middleware for POST /books and PUT /books/:id
 */
function validateBookBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      message: 'Request body must be a valid JSON object'
    });
  }

  const { title, author, price } = req.body;

  // Validate Title
  if (title === undefined || title === null || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      message: 'Title is required and must be a non-empty string'
    });
  }

  // Validate Author
  if (author === undefined || author === null || typeof author !== 'string' || author.trim() === '') {
    return res.status(400).json({
      message: 'Author is required and must be a non-empty string'
    });
  }

  // Validate Price
  if (price === undefined || price === null || typeof price !== 'number' || isNaN(price) || price < 0) {
    return res.status(400).json({
      message: 'Price is required and must be a non-negative number'
    });
  }

  next();
}

/**
 * Validation Middleware for ID path parameter
 */
function validateBookId(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      message: 'Invalid book ID. ID must be a positive integer'
    });
  }
  req.bookId = id;
  next();
}

/**
 * GET /books
 * Supports query parameters:
 * - search_q: partial title match (default: empty / all)
 * - order_by: id, title, author, price, created_at (default: id)
 * - order: ASC or DESC (default: ASC)
 * - limit: positive integer (default: 10)
 * - offset: non-negative integer (default: 0)
 * - min_price: numeric filter (optional)
 * - max_price: numeric filter (optional)
 */
router.get('/', async (req, res) => {
  try {
    let {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = '10',
      offset = '0',
      min_price,
      max_price
    } = req.query;

    // Validate and whitelist order_by
    const allowedSortFields = {
      id: 'id',
      title: 'title',
      author: 'author',
      price: 'price',
      created_at: 'created_at'
    };

    const lowerOrderBy = String(order_by).toLowerCase();
    if (!allowedSortFields[lowerOrderBy]) {
      return res.status(400).json({
        message: `Invalid order_by field. Allowed fields: ${Object.keys(allowedSortFields).join(', ')}`
      });
    }
    const safeOrderBy = allowedSortFields[lowerOrderBy];

    // Validate and whitelist order (ASC / DESC)
    const upperOrder = String(order).toUpperCase();
    if (upperOrder !== 'ASC' && upperOrder !== 'DESC') {
      return res.status(400).json({
        message: 'Invalid order direction. Allowed values: ASC, DESC'
      });
    }
    const safeOrder = upperOrder;

    // Validate limit
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        message: 'limit must be a positive integer'
      });
    }

    // Validate offset
    const parsedOffset = parseInt(offset, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        message: 'offset must be a non-negative integer'
      });
    }

    // Prepare parameterized SQL query
    const conditions = [];
    const params = [];

    // search_q partial match using LIKE
    if (search_q && search_q.trim() !== '') {
      conditions.push('title LIKE ?');
      params.push(`%${search_q.trim()}%`);
    }

    // Price range filters
    let parsedMin = undefined;
    let parsedMax = undefined;

    if (min_price !== undefined) {
      parsedMin = parseFloat(min_price);
      if (isNaN(parsedMin) || parsedMin < 0) {
        return res.status(400).json({
          message: 'min_price must be a non-negative number'
        });
      }
    }

    if (max_price !== undefined) {
      parsedMax = parseFloat(max_price);
      if (isNaN(parsedMax) || parsedMax < 0) {
        return res.status(400).json({
          message: 'max_price must be a non-negative number'
        });
      }
    }

    if (parsedMin !== undefined && parsedMax !== undefined) {
      if (parsedMin > parsedMax) {
        return res.status(400).json({
          message: 'min_price cannot be greater than max_price'
        });
      }
      conditions.push('price BETWEEN ? AND ?');
      params.push(parsedMin, parsedMax);
    } else if (parsedMin !== undefined) {
      conditions.push('price >= ?');
      params.push(parsedMin);
    } else if (parsedMax !== undefined) {
      conditions.push('price <= ?');
      params.push(parsedMax);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count for metadata
    const countSql = `SELECT COUNT(*) as total FROM books ${whereClause}`;
    const totalResult = await db.get(countSql, params);
    const totalCount = totalResult ? totalResult.total : 0;

    // Fetch filtered, sorted, paginated records using parameterized query
    const sql = `SELECT * FROM books ${whereClause} ORDER BY ${safeOrderBy} ${safeOrder} LIMIT ? OFFSET ?`;
    const queryParams = [...params, parsedLimit, parsedOffset];
    const books = await db.all(sql, queryParams);

    return res.status(200).json({
      total: totalCount,
      limit: parsedLimit,
      offset: parsedOffset,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({
      message: 'Internal server error while fetching books'
    });
  }
});

/**
 * GET /books/:id
 * Retrieve a single book by ID
 */
router.get('/:id', validateBookId, async (req, res) => {
  try {
    const book = await db.get('SELECT * FROM books WHERE id = ?', [req.bookId]);

    if (!book) {
      return res.status(404).json({
        message: `Book with id ${req.bookId} not found`
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return res.status(500).json({
      message: 'Internal server error while fetching book'
    });
  }
});

/**
 * POST /books
 * Create a new book
 * Returns 201 Created on success
 */
router.post('/', validateBookBody, async (req, res) => {
  try {
    const { title, author, price } = req.body;

    const result = await db.run(
      'INSERT INTO books (title, author, price) VALUES (?, ?, ?)',
      [title.trim(), author.trim(), price]
    );

    const newBook = await db.get('SELECT * FROM books WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      message: 'Book created successfully',
      book: newBook
    });
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json({
      message: 'Internal server error while creating book'
    });
  }
});

/**
 * PUT /books/:id
 * Update an existing book
 * Returns 200 OK on success, 404 if not found
 */
router.put('/:id', validateBookId, validateBookBody, async (req, res) => {
  try {
    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [req.bookId]);

    if (!existingBook) {
      return res.status(404).json({
        message: `Book with id ${req.bookId} not found`
      });
    }

    const { title, author, price } = req.body;

    await db.run(
      'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?',
      [title.trim(), author.trim(), price, req.bookId]
    );

    const updatedBook = await db.get('SELECT * FROM books WHERE id = ?', [req.bookId]);

    return res.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return res.status(500).json({
      message: 'Internal server error while updating book'
    });
  }
});

/**
 * DELETE /books/:id
 * Delete a book by ID
 * Returns 200 OK on success, 404 if not found
 */
router.delete('/:id', validateBookId, async (req, res) => {
  try {
    const existingBook = await db.get('SELECT * FROM books WHERE id = ?', [req.bookId]);

    if (!existingBook) {
      return res.status(404).json({
        message: `Book with id ${req.bookId} not found`
      });
    }

    await db.run('DELETE FROM books WHERE id = ?', [req.bookId]);

    return res.status(200).json({
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return res.status(500).json({
      message: 'Internal server error while deleting book'
    });
  }
});

module.exports = router;
