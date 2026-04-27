const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const createAuthRouter = ({ pool }) => {
  const router = express.Router();

  router.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name]
      );
      res.status(201).json({ message: 'Success' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = users[0];
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImg: user.profile_img,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/auth/forgot-password', async (req, res) => {
    const { email, name, newPassword } = req.body;

    try {
      const [users] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND name = ?',
        [email, name]
      );
      if (users.length === 0) {
        return res.status(404).json({ message: '입력하신 정보와 일치하는 사용자를 찾을 수 없습니다.' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, users[0].id]);
      res.json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = createAuthRouter;
