const express = require('express');
const { getDb } = require('../database/db');
const { authenticate } = require('./auth');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  const { 
    platform, 
    category, 
    search, 
    sort = 'hot', 
    page = 1, 
    limit = 50 
  } = req.query;

  let query = `
    SELECT hi.*, p.name as platform_name, p.display_name, p.color, p.icon,
           e.platform_count as multi_platform
    FROM hot_items hi
    JOIN platforms p ON hi.platform_id = p.id
    LEFT JOIN events e ON hi.event_id = e.id
    WHERE 1=1
  `;
  const params = [];

  if (platform) {
    query += ' AND p.name = ?';
    params.push(platform);
  }

  if (category && category !== '全部') {
    query += ' AND hi.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND hi.title LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' AND hi.crawled_at >= datetime(\'now\', \'-24 hours\')';

  if (sort === 'hot') {
    query += ' ORDER BY hi.hot_value DESC';
  } else {
    query += ' ORDER BY hi.crawled_at DESC';
  }

  const offset = (page - 1) * limit;
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, items) => {
    if (err) {
      console.error('查询热榜失败:', err);
      return res.status(500).json({ error: '获取热榜失败' });
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM hot_items hi
      JOIN platforms p ON hi.platform_id = p.id
      WHERE 1=1
      ${platform ? ' AND p.name = ?' : ''}
      ${category && category !== '全部' ? ' AND hi.category = ?' : ''}
      ${search ? ' AND hi.title LIKE ?' : ''}
      AND hi.crawled_at >= datetime(\'now\', \'-24 hours\')
    `;

    db.get(countQuery, params.slice(0, params.length - 2), (err, result) => {
      if (err) {
        console.error('获取总数失败:', err);
        return res.status(500).json({ error: '获取总数失败' });
      }

      res.json({
        items,
        total: result?.total || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    });
  });
});

router.get('/platforms', (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  db.all('SELECT * FROM platforms WHERE enabled = 1', [], (err, platforms) => {
    if (err) {
      return res.status(500).json({ error: '获取平台列表失败' });
    }
    res.json(platforms);
  });
});

router.get('/categories', (req, res) => {
  const categories = [
    { id: 'all', name: '全部' },
    { id: '娱乐', name: '娱乐' },
    { id: '科技', name: '科技' },
    { id: '财经', name: '财经' },
    { id: '社会', name: '社会' },
    { id: '体育', name: '体育' },
    { id: '游戏', name: '游戏' },
    { id: '职场', name: '职场' },
    { id: '其他', name: '其他' }
  ];
  res.json(categories);
});

router.get('/favorites', authenticate, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  db.all(`
    SELECT hi.*, p.name as platform_name, p.display_name, p.color, p.icon,
           uf.created_at as favorited_at
    FROM user_favorites uf
    JOIN hot_items hi ON uf.hot_item_id = hi.id
    JOIN platforms p ON hi.platform_id = p.id
    WHERE uf.user_id = ?
    ORDER BY uf.created_at DESC
    LIMIT ? OFFSET ?
  `, [req.userId, parseInt(limit), parseInt(offset)], (err, items) => {
    if (err) {
      return res.status(500).json({ error: '获取收藏失败' });
    }

    db.get(`
      SELECT COUNT(*) as total
      FROM user_favorites
      WHERE user_id = ?
    `, [req.userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: '获取总数失败' });
      }

      res.json({
        items,
        total: result?.total || 0,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    });
  });
});

router.post('/favorites/:id', authenticate, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  const hotItemId = req.params.id;

  db.run(`
    INSERT OR IGNORE INTO user_favorites (user_id, hot_item_id)
    VALUES (?, ?)
  `, [req.userId, hotItemId], function(err) {
    if (err) {
      return res.status(500).json({ error: '收藏失败' });
    }

    res.json({ success: true, message: '收藏成功' });
  });
});

router.delete('/favorites/:id', authenticate, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  const hotItemId = req.params.id;

  db.run(`
    DELETE FROM user_favorites
    WHERE user_id = ? AND hot_item_id = ?
  `, [req.userId, hotItemId], function(err) {
    if (err) {
      return res.status(500).json({ error: '取消收藏失败' });
    }

    res.json({ success: true, message: '取消收藏成功' });
  });
});

router.get('/blocked-keywords', authenticate, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  db.all(`
    SELECT * FROM blocked_keywords
    WHERE user_id = ?
    ORDER BY created_at DESC
  `, [req.userId], (err, keywords) => {
    if (err) {
      return res.status(500).json({ error: '获取屏蔽关键词失败' });
    }

    res.json(keywords);
  });
});

router.post('/blocked-keywords', authenticate, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  const { keyword } = req.body;

  if (!keyword || keyword.trim().length === 0) {
    return res.status(400).json({ error: '关键词不能为空' });
  }

  db.run(`
    INSERT OR IGNORE INTO blocked_keywords (user_id, keyword)
    VALUES (?, ?)
  `, [req.userId, keyword.trim()], function(err) {
    if (err) {
      return res.status(500).json({ error: '添加屏蔽关键词失败' });
    }

    res.json({ success: true, message: '添加成功' });
  });
});

router.delete('/blocked-keywords/:id', authenticate, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  const keywordId = req.params.id;

  db.run(`
    DELETE FROM blocked_keywords
    WHERE user_id = ? AND id = ?
  `, [req.userId, keywordId], function(err) {
    if (err) {
      return res.status(500).json({ error: '删除屏蔽关键词失败' });
    }

    res.json({ success: true, message: '删除成功' });
  });
});

router.get('/user/profile', authenticate, (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: '获取用户信息失败' });
    }

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  });
});

module.exports = router;
