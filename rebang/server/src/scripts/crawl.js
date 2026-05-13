require('dotenv').config();
const { crawlAllPlatforms, cleanupOldData } = require('../services/crawlService');

async function main() {
  try {
    await crawlAllPlatforms();
    await cleanupOldData();
    console.log('爬取任务完成');
    process.exit(0);
  } catch (error) {
    console.error('爬取任务失败:', error);
    process.exit(1);
  }
}

main();
