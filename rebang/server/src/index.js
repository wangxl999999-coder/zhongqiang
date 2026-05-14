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

const { initDatabase } = require('./database/db');
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

app.get('/', (req, res) => {
  res.json({
    message: '热榜聚合 API 服务',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      hotlist: '/api/hotlist',
      platforms: '/api/hotlist/platforms',
      categories: '/api/hotlist/categories'
    }
  });
});

async function startServer() {
  try {
    await initDatabase();
    console.log('数据库初始化完成');

    await crawlAllPlatforms();
    
    await cleanupOldData();

    app.listen(PORT, () => {
      console.log(`====================================`);
      console.log(`  服务器运行在 http://localhost:${PORT}`);
      console.log(`  API 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`====================================`);
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

  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();
