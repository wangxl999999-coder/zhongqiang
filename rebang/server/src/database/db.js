const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/rebang.db');

let dbInstance = null;
let initPromise = null;

function initDatabase() {
  if (initPromise) return initPromise;
  
  initPromise = new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('数据库连接失败:', err.message);
        reject(err);
        return;
      }
      console.log('数据库连接成功');
      
      initTables(db)
        .then(() => {
          dbInstance = db;
          resolve(db);
        })
        .catch(reject);
    });
  });
  
  return initPromise;
}

function initTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const tablePromises = [];
      
      const runQuery = (query) => {
        return new Promise((res, rej) => {
          db.run(query, (err) => {
            if (err) rej(err);
            else res();
          });
        });
      };

      tablePromises.push(runQuery(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone TEXT UNIQUE NOT NULL,
          nickname TEXT,
          avatar TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `));

      tablePromises.push(runQuery(`
        CREATE TABLE IF NOT EXISTS verification_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `));

      tablePromises.push(runQuery(`
        CREATE TABLE IF NOT EXISTS platforms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          icon TEXT,
          color TEXT,
          enabled INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `));

      tablePromises.push(runQuery(`
        CREATE TABLE IF NOT EXISTS hot_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          url TEXT,
          hot_value INTEGER DEFAULT 0,
          rank INTEGER,
          category TEXT DEFAULT '其他',
          image_url TEXT,
          crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          event_id INTEGER,
          FOREIGN KEY (platform_id) REFERENCES platforms (id)
        )
      `));

      tablePromises.push(runQuery(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          platform_count INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `));

      tablePromises.push(runQuery(`
        CREATE TABLE IF NOT EXISTS user_favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          hot_item_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (hot_item_id) REFERENCES hot_items (id),
          UNIQUE(user_id, hot_item_id)
        )
      `));

      tablePromises.push(runQuery(`
        CREATE TABLE IF NOT EXISTS blocked_keywords (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          keyword TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(user_id, keyword)
        )
      `));

      Promise.all(tablePromises)
        .then(() => {
          const platforms = [
            { name: 'zhihu', display_name: '知乎', icon: '知乎', color: '#0084ff' },
            { name: 'bilibili', display_name: 'B站', icon: 'B站', color: '#fb7299' },
            { name: 'douyin', display_name: '抖音', icon: '抖音', color: '#000000' },
            { name: 'xiaohongshu', display_name: '小红书', icon: '小红书', color: '#ff2442' },
            { name: 'weibo', display_name: '微博', icon: '微博', color: '#e6162d' },
            { name: 'baidutieba', display_name: '百度贴吧', icon: '贴吧', color: '#3385ff' }
          ];

          const insertPromises = platforms.map(p => {
            return new Promise((res) => {
              db.run(`
                INSERT OR IGNORE INTO platforms (name, display_name, icon, color)
                VALUES (?, ?, ?, ?)
              `, [p.name, p.display_name, p.icon, p.color], (err) => {
                if (err) console.error('插入平台失败:', err);
                res();
              });
            });
          });

          return Promise.all(insertPromises);
        })
        .then(() => {
          console.log('数据库表初始化完成');
          resolve();
        })
        .catch(reject);
    });
  });
}

function getDb() {
  return dbInstance;
}

module.exports = { initDatabase, getDb };
