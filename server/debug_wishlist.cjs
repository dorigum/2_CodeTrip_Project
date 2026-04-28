const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

(async () => {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- Wishlist DB Check ---');
        
        // 1. 테이블 구조 확인
        const [desc] = await pool.query('DESCRIBE wishlists');
        console.log('Table wishlists structure:', desc.map(d => `${d.Field} (${d.Type})`));

        // 2. 최근 5개 데이터 확인
        const [rows] = await pool.query('SELECT * FROM wishlists ORDER BY created_at DESC LIMIT 5');
        console.log('Recent 5 wishlist entries:', rows);

        // 3. 전체 개수 확인
        const [count] = await pool.query('SELECT COUNT(*) as total FROM wishlists');
        console.log('Total wishlist count:', count[0].total);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit();
    }
})();
