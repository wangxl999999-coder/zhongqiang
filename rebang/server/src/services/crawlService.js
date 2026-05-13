const db = require('../database/db');
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
        
        db.run('BEGIN TRANSACTION');
        
        for (const item of items) {
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
          ]);
        }
        
        db.run('COMMIT', (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`${platformName} 热榜爬取完成，共 ${items.length} 条`);
            resolve(items);
          }
        });
      } catch (error) {
        reject(error);
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
  
  await updateEventRelations();
  console.log('所有平台爬取完成');
}

async function cleanupOldData() {
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
