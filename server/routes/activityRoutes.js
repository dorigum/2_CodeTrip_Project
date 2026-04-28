const express = require('express');

const createActivityRouter = ({ pool, authenticateToken, travelCache }) => {
  const router = express.Router();

  router.get('/my/board-posts', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.id, p.title, p.content, p.view_count, p.created_at,
          COUNT(DISTINCT c.id) AS comment_count,
          COUNT(DISTINCT pl.id) AS like_count
        FROM board_posts p
        LEFT JOIN board_comments c ON c.post_id = p.id
        LEFT JOIN board_post_likes pl ON pl.post_id = p.id
        WHERE p.user_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `, [req.user.id]);
      res.json(rows.map(r => ({
        ...r,
        comment_count: Number(r.comment_count),
        like_count: Number(r.like_count),
      })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/my/board-comments', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT c.id, c.body, c.created_at, c.post_id, p.title AS post_title,
          COUNT(cl.id) AS like_count
        FROM board_comments c
        JOIN board_posts p ON p.id = c.post_id
        LEFT JOIN board_comment_likes cl ON cl.comment_id = c.id
        WHERE c.user_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `, [req.user.id]);
      res.json(rows.map(r => ({ ...r, like_count: Number(r.like_count) })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/my/travel-comments', authenticateToken, async (req, res) => {
    const { travelTitleMap } = travelCache.getCache();

    try {
      const [rows] = await pool.query(`
        SELECT tc.id, tc.content_id, tc.body, tc.created_at,
          COUNT(tcl.id) AS like_count
        FROM travel_comments tc
        LEFT JOIN travel_comment_likes tcl ON tcl.comment_id = tc.id
        WHERE tc.user_id = ?
        GROUP BY tc.id
        ORDER BY tc.created_at DESC
      `, [req.user.id]);
      res.json(rows.map(r => ({
        ...r,
        like_count: Number(r.like_count),
        title: travelTitleMap.get(String(r.content_id)) || null,
      })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/my/liked-posts', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.id, p.title, p.content, p.view_count, p.created_at, p.nickname,
          COUNT(DISTINCT c.id) AS comment_count,
          COUNT(DISTINCT pl.id) AS like_count
        FROM board_post_likes bpl
        JOIN board_posts p ON p.id = bpl.post_id
        LEFT JOIN board_comments c ON c.post_id = p.id
        LEFT JOIN board_post_likes pl ON pl.post_id = p.id
        WHERE bpl.user_id = ?
        GROUP BY p.id
        ORDER BY bpl.created_at DESC
      `, [req.user.id]);
      res.json(rows.map(r => ({
        ...r,
        comment_count: Number(r.comment_count),
        like_count: Number(r.like_count),
      })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = createActivityRouter;
