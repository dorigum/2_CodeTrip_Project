const express = require('express');

const createActivityRouter = ({ pool, authenticateToken, travelCache }) => {
  const router = express.Router();

  router.get('/my/board-posts', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.id, p.title, p.content, p.view_count, p.created_at,
          COUNT(DISTINCT c.id) AS comment_count
        FROM board_posts p
        LEFT JOIN board_comments c ON c.post_id = p.id
        WHERE p.user_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `, [req.user.id]);
      res.json(rows.map(r => ({ ...r, comment_count: Number(r.comment_count) })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/my/board-comments', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT c.id, c.body, c.created_at, c.post_id, p.title AS post_title
        FROM board_comments c
        JOIN board_posts p ON p.id = c.post_id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
      `, [req.user.id]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/my/travel-comments', authenticateToken, async (req, res) => {
    const { travelTitleMap } = travelCache.getCache();

    try {
      const [rows] = await pool.query(`
        SELECT id, content_id, body, created_at
        FROM travel_comments
        WHERE user_id = ?
        ORDER BY created_at DESC
      `, [req.user.id]);
      res.json(rows.map(r => ({
        ...r,
        title: travelTitleMap.get(String(r.content_id)) || null,
      })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = createActivityRouter;
