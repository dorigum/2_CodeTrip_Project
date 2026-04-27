const express = require('express');
const { getUserIdFromRequest } = require('../middleware/auth');

const createTravelCommentRouter = ({ pool, authenticateToken }) => {
  const router = express.Router();

  router.get('/travel-comments/:contentId', async (req, res) => {
    const userId = getUserIdFromRequest(req);

    try {
      const [rows] = await pool.query(`
        SELECT c.id, c.content_id, c.user_id, c.nickname, c.body, c.created_at,
          COUNT(cl.id) AS likes,
          COALESCE(MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END), 0) AS liked
        FROM travel_comments c
        LEFT JOIN travel_comment_likes cl ON cl.comment_id = c.id
        WHERE c.content_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `, [userId, req.params.contentId]);

      res.json(rows.map(r => ({ ...r, likes: Number(r.likes), liked: !!r.liked })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/travel-comments/:id/like', authenticateToken, async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.id;

    try {
      const [existing] = await pool.query(
        'SELECT id FROM travel_comment_likes WHERE comment_id = ? AND user_id = ?',
        [commentId, userId]
      );
      if (existing.length > 0) {
        await pool.query('DELETE FROM travel_comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
      } else {
        await pool.query('INSERT INTO travel_comment_likes (comment_id, user_id) VALUES (?, ?)', [commentId, userId]);
      }

      const [[{ likes }]] = await pool.query(
        'SELECT COUNT(*) AS likes FROM travel_comment_likes WHERE comment_id = ?',
        [commentId]
      );
      res.json({ liked: existing.length === 0, likes: Number(likes) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/travel-comments', authenticateToken, async (req, res) => {
    const { content_id, nickname, body } = req.body;
    if (!content_id || !body || !body.trim()) {
      return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO travel_comments (content_id, user_id, nickname, body) VALUES (?, ?, ?, ?)',
        [content_id, req.user.id, nickname || '익명', body.trim()]
      );
      const [rows] = await pool.query('SELECT * FROM travel_comments WHERE id = ?', [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/travel-comments/:id', authenticateToken, async (req, res) => {
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ message: '내용을 입력해주세요.' });

    try {
      const [rows] = await pool.query('SELECT * FROM travel_comments WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

      await pool.query('UPDATE travel_comments SET body = ? WHERE id = ?', [body.trim(), req.params.id]);
      const [updated] = await pool.query('SELECT * FROM travel_comments WHERE id = ?', [req.params.id]);
      res.json(updated[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/travel-comments/:id', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM travel_comments WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

      await pool.query('DELETE FROM travel_comments WHERE id = ?', [req.params.id]);
      res.json({ message: '삭제되었습니다.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = createTravelCommentRouter;
