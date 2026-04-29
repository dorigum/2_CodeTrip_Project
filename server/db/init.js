const initDB = async (pool, retries = 10, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      console.log('Database connected');

      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(100) NOT NULL,
          profile_img VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS travel_comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          content_id VARCHAR(50) NOT NULL,
          user_id INT,
          nickname VARCHAR(100) NOT NULL DEFAULT '익명',
          body TEXT NOT NULL,
          likes INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_content_id (content_id)
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS travel_comment_likes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          comment_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_comment_user (comment_id, user_id)
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS wishlists (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          content_id VARCHAR(50) NOT NULL,
          title VARCHAR(255),
          image_url TEXT,
          folder_id INT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_user_content (user_id, content_id)
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS board_posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          nickname VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          view_count INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS board_post_tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
          post_id INT NOT NULL,
          content_id VARCHAR(50) NOT NULL,
          title VARCHAR(255),
          firstimage TEXT,
          INDEX idx_board_post_tags_post_id (post_id)
        )
      `);
      
      await conn.query(`
        CREATE TABLE IF NOT EXISTS board_post_likes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          post_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_board_post_user (post_id, user_id)
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS board_comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          post_id INT NOT NULL,
          user_id INT NOT NULL,
          nickname VARCHAR(100) NOT NULL,
          body TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_board_comments_post_id (post_id)
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS board_comment_likes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          comment_id INT NOT NULL,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_board_comment_user (comment_id, user_id)
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS wishlist_folders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          start_date DATE NULL,
          end_date DATE NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS wishlist_notes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          folder_id INT NOT NULL,
          user_id INT NOT NULL,
          content TEXT NOT NULL,
          is_completed BOOLEAN DEFAULT FALSE,
          type ENUM('MEMO', 'CHECKLIST') DEFAULT 'CHECKLIST',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (folder_id) REFERENCES wishlist_folders(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          message VARCHAR(500) NOT NULL,
          content_id VARCHAR(50),
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_notifications_user_id (user_id)
        )
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS user_favorite_regions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          region_code VARCHAR(10) NOT NULL,
          UNIQUE KEY uq_user_region (user_id, region_code),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      try { await conn.query('ALTER TABLE wishlists ADD COLUMN title VARCHAR(255)'); } catch {}
      try { await conn.query('ALTER TABLE wishlists ADD COLUMN image_url TEXT'); } catch {}
      try { await conn.query('ALTER TABLE wishlist_folders ADD COLUMN start_date DATE NULL'); } catch {}
      try { await conn.query('ALTER TABLE wishlist_folders ADD COLUMN end_date DATE NULL'); } catch {}

      console.log('Database schema initialized');
      conn.release();
      return;
    } catch (err) {
      console.error(`DB init failed (${attempt}/${retries}): ${err.message}`);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('DB init failed permanently. Exiting server.');
        process.exit(1);
      }
    }
  }
};

module.exports = initDB;
