const express = require('express');
const { getUserIdFromRequest } = require('../middleware/auth');

const createBoardRouter = ({ pool, authenticateToken }) => {
  const router = express.Router();

  router.get('/board/posts', async (req, res) => {
    const pageNo = Math.max(1, parseInt(req.query.pageNo) || 1);
    const numOfRows = Math.max(1, parseInt(req.query.numOfRows) || 10);
    const keyword = (req.query.keyword || '').trim();
    const sort = req.query.sort || 'created_at';
    const offset = (pageNo - 1) * numOfRows;

    const orderByMap = {
      created_at: 'p.created_at DESC',
      updated_at: 'p.updated_at DESC',
      likes: 'like_count DESC, p.created_at DESC',
    };
    const orderBy = orderByMap[sort] || orderByMap.created_at;

    try {
      const whereClause = keyword
        ? `WHERE p.title LIKE ? OR p.content LIKE ?
           OR EXISTS (SELECT 1 FROM board_post_tags t WHERE t.post_id = p.id AND t.title LIKE ?)`
        : '';
      const queryParams = keyword ? [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`] : [];

      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM board_posts p ${whereClause}`,
        queryParams
      );

      const [rows] = await pool.query(`
        SELECT p.id, p.user_id, p.nickname, p.title, p.content, p.view_count, p.created_at, p.updated_at,
          COUNT(DISTINCT c.id) AS comment_count,
          COUNT(DISTINCT pl.id) AS like_count
        FROM board_posts p
        LEFT JOIN board_comments c ON c.post_id = p.id
        LEFT JOIN board_post_likes pl ON pl.post_id = p.id
        ${whereClause}
        GROUP BY p.id
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `, [...queryParams, numOfRows, offset]);

      const postIds = rows.map(r => r.id);
      let tags = [];
      if (postIds.length > 0) {
        [tags] = await pool.query(
          `SELECT * FROM board_post_tags WHERE post_id IN (${postIds.map(() => '?').join(',')})`,
          postIds
        );
      }

      const tagsMap = {};
      tags.forEach(t => {
        if (!tagsMap[t.post_id]) tagsMap[t.post_id] = [];
        tagsMap[t.post_id].push(t);
      });

      const posts = rows.map(r => ({
        ...r,
        comment_count: Number(r.comment_count),
        like_count: Number(r.like_count),
        tags: tagsMap[r.id] || [],
      }));

      res.json({ posts, totalCount: Number(total) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/board/posts/:id', async (req, res) => {
    const userId = getUserIdFromRequest(req);
    try {
      const [rows] = await pool.query(`
        SELECT p.*,
          COUNT(DISTINCT pl.id) AS like_count,
          COALESCE(MAX(CASE WHEN pl.user_id = ? THEN 1 ELSE 0 END), 0) AS liked
        FROM board_posts p
        LEFT JOIN board_post_likes pl ON pl.post_id = p.id
        WHERE p.id = ?
        GROUP BY p.id
      `, [userId, req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

      await pool.query('UPDATE board_posts SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
      const [tags] = await pool.query('SELECT * FROM board_post_tags WHERE post_id = ?', [req.params.id]);
      res.json({
        ...rows[0],
        view_count: rows[0].view_count + 1,
        like_count: Number(rows[0].like_count),
        liked: !!rows[0].liked,
        tags,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/board/posts', authenticateToken, async (req, res) => {
    const { title, content, tags = [] } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
    }

    const conn = await pool.getConnection();
    try {
      const [userRows] = await conn.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
      const nickname = userRows[0]?.name || '익명';

      await conn.beginTransaction();
      const [result] = await conn.query(
        'INSERT INTO board_posts (user_id, nickname, title, content) VALUES (?, ?, ?, ?)',
        [req.user.id, nickname, title.trim(), content.trim()]
      );
      const postId = result.insertId;

      if (tags.length > 0) {
        const tagValues = tags.map(t => [postId, t.content_id, t.title, t.firstimage || '']);
        await conn.query(
          'INSERT INTO board_post_tags (post_id, content_id, title, firstimage) VALUES ?',
          [tagValues]
        );
      }

      await conn.commit();
      res.status(201).json({ id: postId });
    } catch (err) {
      await conn.rollback();
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  });

  router.put('/board/posts/:id', authenticateToken, async (req, res) => {
    const { title, content, tags = [] } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT * FROM board_posts WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

      await conn.beginTransaction();
      await conn.query(
        'UPDATE board_posts SET title = ?, content = ? WHERE id = ?',
        [title.trim(), content.trim(), req.params.id]
      );
      await conn.query('DELETE FROM board_post_tags WHERE post_id = ?', [req.params.id]);

      if (tags.length > 0) {
        const tagValues = tags.map(t => [req.params.id, t.content_id, t.title, t.firstimage || '']);
        await conn.query(
          'INSERT INTO board_post_tags (post_id, content_id, title, firstimage) VALUES ?',
          [tagValues]
        );
      }

      await conn.commit();
      res.json({ message: '수정되었습니다.' });
    } catch (err) {
      await conn.rollback();
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  });

  router.delete('/board/posts/:id', authenticateToken, async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT * FROM board_posts WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

      await conn.beginTransaction();
      await conn.query('DELETE FROM board_post_tags WHERE post_id = ?', [req.params.id]);
      await conn.query('DELETE FROM board_post_likes WHERE post_id = ?', [req.params.id]);
      await conn.query(`
        DELETE bcl FROM board_comment_likes bcl
        INNER JOIN board_comments bc ON bcl.comment_id = bc.id
        WHERE bc.post_id = ?
      `, [req.params.id]);
      await conn.query('DELETE FROM board_comments WHERE post_id = ?', [req.params.id]);
      await conn.query('DELETE FROM board_posts WHERE id = ?', [req.params.id]);
      await conn.commit();

      res.json({ message: '삭제되었습니다.' });
    } catch (err) {
      await conn.rollback();
      res.status(500).json({ error: err.message });
    } finally {
      conn.release();
    }
  });

  router.get('/board/posts/:id/comments', async (req, res) => {
    const userId = getUserIdFromRequest(req);

    try {
      const [rows] = await pool.query(`
        SELECT c.id, c.post_id, c.user_id, c.nickname, c.body, c.created_at,
          COUNT(cl.id) AS likes,
          COALESCE(MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END), 0) AS liked
        FROM board_comments c
        LEFT JOIN board_comment_likes cl ON cl.comment_id = c.id
        WHERE c.post_id = ?
        GROUP BY c.id
        ORDER BY c.created_at ASC
      `, [userId, req.params.id]);

      res.json(rows.map(r => ({ ...r, likes: Number(r.likes), liked: !!r.liked })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/board/posts/:id/comments', authenticateToken, async (req, res) => {
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ message: '내용을 입력해주세요.' });

    try {
      const [postRows] = await pool.query('SELECT id, user_id, title FROM board_posts WHERE id = ?', [req.params.id]);
      if (postRows.length === 0) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

      const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
      const nickname = userRows[0]?.name || '익명';

      const [result] = await pool.query(
        'INSERT INTO board_comments (post_id, user_id, nickname, body) VALUES (?, ?, ?, ?)',
        [req.params.id, req.user.id, nickname, body.trim()]
      );
      const [rows] = await pool.query('SELECT * FROM board_comments WHERE id = ?', [result.insertId]);
      res.status(201).json({ ...rows[0], likes: 0, liked: false });

      // 게시글 작성자가 댓글 작성자와 다를 때만 알림 생성
      const post = postRows[0];
      if (post.user_id !== req.user.id) {
        const message = `'${post.title}' 게시글에 ${nickname}님이 댓글을 남겼습니다.`;
        pool.query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [post.user_id, message]
        ).catch(() => {});
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/board/comments/:id', authenticateToken, async (req, res) => {
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ message: '내용을 입력해주세요.' });

    try {
      const [rows] = await pool.query('SELECT * FROM board_comments WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

      await pool.query('UPDATE board_comments SET body = ? WHERE id = ?', [body.trim(), req.params.id]);
      const [updated] = await pool.query(`
        SELECT c.*, COUNT(cl.id) AS likes,
          COALESCE(MAX(CASE WHEN cl.user_id = ? THEN 1 ELSE 0 END), 0) AS liked
        FROM board_comments c
        LEFT JOIN board_comment_likes cl ON cl.comment_id = c.id
        WHERE c.id = ?
        GROUP BY c.id
      `, [req.user.id, req.params.id]);

      res.json({ ...updated[0], likes: Number(updated[0].likes), liked: !!updated[0].liked });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/board/comments/:id', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM board_comments WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
      if (rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });

      await pool.query('DELETE FROM board_comment_likes WHERE comment_id = ?', [req.params.id]);
      await pool.query('DELETE FROM board_comments WHERE id = ?', [req.params.id]);
      res.json({ message: '삭제되었습니다.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/board/posts/:id/like', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
      const [existing] = await pool.query(
        'SELECT id FROM board_post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      if (existing.length > 0) {
        await pool.query('DELETE FROM board_post_likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
      } else {
        await pool.query('INSERT INTO board_post_likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      }

      const [[{ likes }]] = await pool.query(
        'SELECT COUNT(*) AS likes FROM board_post_likes WHERE post_id = ?',
        [postId]
      );
      res.json({ liked: existing.length === 0, likes: Number(likes) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/board/comments/:id/like', authenticateToken, async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.id;

    try {
      const [existing] = await pool.query(
        'SELECT id FROM board_comment_likes WHERE comment_id = ? AND user_id = ?',
        [commentId, userId]
      );
      if (existing.length > 0) {
        await pool.query('DELETE FROM board_comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, userId]);
      } else {
        await pool.query('INSERT INTO board_comment_likes (comment_id, user_id) VALUES (?, ?)', [commentId, userId]);
      }

      const [[{ likes }]] = await pool.query(
        'SELECT COUNT(*) AS likes FROM board_comment_likes WHERE comment_id = ?',
        [commentId]
      );
      res.json({ liked: existing.length === 0, likes: Number(likes) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = createBoardRouter;
