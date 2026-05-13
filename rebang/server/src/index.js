require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = require('./database/db');
const { router: authRouter } = require('./routes/auth');
const hotlistRouter = require('./routes/hotlist');
const { crawlAllPlatforms, cleanupOldData } = require('./services/crawlService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/hotlist', hotlistRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

cron.schedule('0 * * * *', async () => {
  console.log('执行定时爬取任务:', new Date().toISOString());
  try {
    await crawlAllPlatforms();
    await cleanupOldData();
  } catch (error) {
    console.error('定时任务失败:', error);
  }
});

app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('执行初始爬取...');
  try {
    await crawlAllPlatforms();
  } catch (error) {
    console.error('初始爬取失败:', error);
  }
});
