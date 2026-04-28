const bcrypt = require('bcryptjs');
const express = require('express');

const createUserRouter = ({ pool, authenticateToken, upload }) => {
  const router = express.Router();

  router.post('/user/upload', authenticateToken, upload.single('profileImage'), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/user/update', authenticateToken, async (req, res) => {
    const { name, profileImg } = req.body;

    try {
      await pool.query(
        'UPDATE users SET name = ?, profile_img = ? WHERE id = ?',
        [name, profileImg, req.user.id]
      );
      res.json({ message: 'Profile updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/user/favorite-regions', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT region_code FROM user_favorite_regions WHERE user_id = ?',
        [req.user.id]
      );
      res.json(rows.map(r => r.region_code));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/user/favorite-regions', authenticateToken, async (req, res) => {
    const { codes = [] } = req.body;
    if (codes.length > 3) {
      return res.status(400).json({ message: '관심지역은 최대 3개까지 선택할 수 있습니다.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM user_favorite_regions WHERE user_id = ?', [req.user.id]);
      if (codes.length > 0) {
        const values = codes.map(code => [req.user.id, code]);
        await conn.query(
          'INSERT INTO user_favorite_regions (user_id, region_code) VALUES ?',
          [values]
        );
      }
      await conn.commit();
      res.json({ message: '관심지역이 저장되었습니다.' });
    } catch (err) {
      await conn.rollback();
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  });

  router.put('/user/password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
      const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
      if (users.length === 0) return res.status(404).json({ message: 'User not found' });

      const isMatch = await bcrypt.compare(currentPassword, users[0].password);
      if (!isMatch) return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);
      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = createUserRouter;
