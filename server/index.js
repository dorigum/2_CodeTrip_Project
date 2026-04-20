const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully to EC2');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Routes
// 1. Get All Boards
app.get('/api/boards', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM boards ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get One Board
app.get('/api/boards/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM boards WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Post not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create Board
app.post('/api/boards', async (req, res) => {
  const { title, content, author } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO boards (title, content, author) VALUES (?, ?, ?)',
      [title, content, author]
    );
    res.status(201).json({ id: result.insertId, title, content, author });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Update Board
app.put('/api/boards/:id', async (req, res) => {
  const { title, content } = req.body;
  try {
    await pool.query(
      'UPDATE boards SET title = ?, content = ? WHERE id = ?',
      [title, content, req.params.id]
    );
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete Board
app.delete('/api/boards/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM boards WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
