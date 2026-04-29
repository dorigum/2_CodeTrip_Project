const express = require('express');

const createNotificationRouter = ({ pool, authenticateToken }) => {
  const router = express.Router();

  router.get('/notifications', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT id, message, content_id, is_read, created_at
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 30`,
        [req.user.id]
      );
      const unreadCount = rows.filter(r => !r.is_read).length;
      res.json({ notifications: rows, unreadCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/notifications/read-all', authenticateToken, async (req, res) => {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
        [req.user.id]
      );
      res.json({ message: '모두 읽음 처리되었습니다.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      res.json({ message: '읽음 처리되었습니다.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/notifications/read', authenticateToken, async (req, res) => {
    try {
      await pool.query(
        'DELETE FROM notifications WHERE user_id = ? AND is_read = TRUE',
        [req.user.id]
      );
      res.json({ message: '읽은 알림이 삭제되었습니다.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/notifications/:id', authenticateToken, async (req, res) => {
    try {
      await pool.query(
        'DELETE FROM notifications WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      res.json({ message: '알림이 삭제되었습니다.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = createNotificationRouter;
