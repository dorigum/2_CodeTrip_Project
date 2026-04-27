const express = require('express');

const createWishlistRouter = ({ pool, authenticateToken, travelCache }) => {
  const router = express.Router();

  router.get('/wishlist/details', authenticateToken, async (req, res) => {
    const { allTravelItems } = travelCache.getCache();

    try {
      const [rows] = await pool.query(
        'SELECT content_id as contentId, title, image_url as imageUrl, folder_id FROM wishlists WHERE user_id = ?',
        [req.user.id]
      );
      const details = rows.map(row => {
        const dbId = String(row.contentId);
        const cached = allTravelItems?.find(item => String(item.contentid || item.contentId) === dbId);
        return {
          ...(cached || {}),
          contentid: dbId,
          title: row.title || cached?.title || '여행지',
          firstimage: row.imageUrl || cached?.firstimage || '',
          folder_id: row.folder_id,
          addr1: cached?.addr1 || '정보 없음',
        };
      });
      res.json(details);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/wishlist/toggle', authenticateToken, async (req, res) => {
    const { contentId, title, imageUrl, folderId } = req.body;

    try {
      const [existing] = await pool.query(
        'SELECT id FROM wishlists WHERE user_id = ? AND content_id = ?',
        [req.user.id, contentId]
      );
      if (existing.length > 0) {
        await pool.query('DELETE FROM wishlists WHERE id = ?', [existing[0].id]);
        return res.json({ wishlisted: false });
      }

      await pool.query(
        'INSERT INTO wishlists (user_id, content_id, title, image_url, folder_id) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, contentId, title, imageUrl, folderId]
      );
      res.json({ wishlisted: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/wishlist/folders', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, user_id, name, DATE_FORMAT(start_date, "%Y-%m-%d") as start_date, DATE_FORMAT(end_date, "%Y-%m-%d") as end_date, created_at, updated_at FROM wishlist_folders WHERE user_id = ?',
        [req.user.id]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/wishlist/folders', authenticateToken, async (req, res) => {
    const { name, startDate, endDate } = req.body;

    try {
      const [result] = await pool.query(
        'INSERT INTO wishlist_folders (user_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
        [req.user.id, name, startDate || null, endDate || null]
      );
      res.status(201).json({
        id: result.insertId,
        name,
        start_date: startDate || null,
        end_date: endDate || null,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/wishlist/folders/:id', authenticateToken, async (req, res) => {
    const { name, startDate, endDate } = req.body;

    try {
      await pool.query(
        'UPDATE wishlist_folders SET name = ?, start_date = ?, end_date = ? WHERE id = ? AND user_id = ?',
        [name, startDate || null, endDate || null, req.params.id, req.user.id]
      );
      res.json({ id: req.params.id, name, start_date: startDate || null, end_date: endDate || null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/wishlist/folders/:id', authenticateToken, async (req, res) => {
    try {
      await pool.query(
        'UPDATE wishlists SET folder_id = NULL WHERE folder_id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      await pool.query('DELETE FROM wishlist_folders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/wishlist/move', authenticateToken, async (req, res) => {
    try {
      await pool.query(
        'UPDATE wishlists SET folder_id = ? WHERE content_id = ? AND user_id = ?',
        [req.body.folderId, req.body.contentId, req.user.id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/wishlist/folders/:folderId/notes', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM wishlist_notes WHERE folder_id = ? AND user_id = ? ORDER BY created_at ASC',
        [req.params.folderId, req.user.id]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/wishlist/folders/:folderId/notes', authenticateToken, async (req, res) => {
    const { content, type } = req.body;

    try {
      const [result] = await pool.query(
        'INSERT INTO wishlist_notes (folder_id, user_id, content, type) VALUES (?, ?, ?, ?)',
        [req.params.folderId, req.user.id, content, type || 'CHECKLIST']
      );
      const [rows] = await pool.query('SELECT * FROM wishlist_notes WHERE id = ?', [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/wishlist/notes/:id/toggle', authenticateToken, async (req, res) => {
    try {
      await pool.query(
        'UPDATE wishlist_notes SET is_completed = NOT is_completed WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/wishlist/notes/:id', authenticateToken, async (req, res) => {
    try {
      await pool.query('DELETE FROM wishlist_notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

module.exports = createWishlistRouter;
