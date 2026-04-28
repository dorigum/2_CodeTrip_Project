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
