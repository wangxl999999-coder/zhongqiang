const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');

const router = express.Router();

router.post('/send-code', (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  const { phone } = req.body;
  
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: '请输入有效的手机号' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  db.run(`
    INSERT INTO verification_codes (phone, code, expires_at)
    VALUES (?, ?, ?)
  `, [phone, code, expiresAt], (err) => {
    if (err) {
      return res.status(500).json({ error: '发送验证码失败' });
    }

    console.log(`====================================`);
    console.log(`  验证码: ${phone} -> ${code}`);
    console.log(`  请在前端输入此验证码`);
    console.log(`====================================`);
    res.json({ success: true, message: '验证码已发送，请查看后端控制台', code });
  });
});

router.post('/login', (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: '数据库未初始化' });
  }

  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: '请提供手机号和验证码' });
  }

  db.get(`
    SELECT * FROM verification_codes
    WHERE phone = ? AND code = ? AND expires_at > datetime('now')
    ORDER BY created_at DESC
    LIMIT 1
  `, [phone, code], (err, verification) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }

    if (!verification) {
      return res.status(400).json({ error: '验证码无效或已过期' });
    }

    db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, user) => {
      if (err) {
        return res.status(500).json({ error: '服务器错误' });
      }

      if (user) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        return res.json({ success: true, token, user });
      }

      db.run(`
        INSERT INTO users (phone, nickname)
        VALUES (?, ?)
      `, [phone, `用户${phone.slice(-4)}`], function(err) {
        if (err) {
          return res.status(500).json({ error: '注册失败' });
        }

        const newUser = {
          id: this.lastID,
          phone,
          nickname: `用户${phone.slice(-4)}`
        };

        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ success: true, token, user: newUser });
      });
    });
  });
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: '无效的token' });
  }
};

module.exports = { router, authenticate };
