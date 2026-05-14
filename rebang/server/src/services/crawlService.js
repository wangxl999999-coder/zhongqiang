const { getDb } = require('../database/db');
const { crawlZhihuHot } = require('../crawlers/zhihu');
const { crawlBilibiliHot } = require('../crawlers/bilibili');
const { crawlDouyinHot } = require('../crawlers/douyin');
const { crawlXiaohongshuHot } = require('../crawlers/xiaohongshu');
const { updateEventRelations } = require('./eventAggregator');

const crawlers = {
  zhihu: crawlZhihuHot,
  bilibili: crawlBilibiliHot,
  douyin: crawlDouyinHot,
  xiaohongshu: crawlXiaohongshuHot
};

async function crawlPlatform(platformName) {
  const db = getDb();
  if (!db) throw new Error('数据库未初始化');

  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM platforms WHERE name = ?', [platformName], async (err, platform) => {
      if (err || !platform) {
        reject(err || new Error(`平台未找到: ${platformName}`));
        return;
      }

      try {
        const crawler = crawlers[platformName];
        if (!crawler) {
          reject(new Error(`未找到爬虫: ${platformName}`));
          return;
        }

        const items = await crawler();
        
        const insertPromises = items.map(item => {
          return new Promise((res, rej) => {
            db.run(`
              INSERT INTO hot_items (platform_id, title, description, url, hot_value, rank, category, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              platform.id,
              item.title,
              item.description,
              item.url,
              item.hot_value,
              item.rank,
              item.category,
              item.image_url
            ], (err) => {
              if (err) rej(err);
              else res();
            });
          });
        });

        await Promise.all(insertPromises);
        console.log(`${platformName} 热榜爬取完成，共 ${items.length} 条`);
        resolve(items);
      } catch (error) {
        console.error(`爬取 ${platformName} 失败:`, error.message);
        resolve([]);
      }
    });
  });
}

async function crawlAllPlatforms() {
  console.log('开始爬取所有平台热榜...');
  
  const platforms = Object.keys(crawlers);
  
  for (const platform of platforms) {
    try {
      await crawlPlatform(platform);
    } catch (error) {
      console.error(`爬取 ${platform} 失败:`, error.message);
    }
  }
  
  try {
    await updateEventRelations();
  } catch (error) {
    console.error('事件聚合失败:', error.message);
  }
  
  console.log('所有平台爬取完成');
}

async function cleanupOldData() {
  const db = getDb();
  if (!db) throw new Error('数据库未初始化');

  return new Promise((resolve, reject) => {
    db.run(`
      DELETE FROM hot_items WHERE crawled_at < datetime('now', '-7 days')
    `, [], (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('旧数据清理完成');
        resolve();
      }
    });
  });
}

module.exports = { crawlPlatform, crawlAllPlatforms, cleanupOldData };
