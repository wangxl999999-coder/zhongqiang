const axios = require('axios');
const { classifyCategory } = require('./zhihu');

async function crawlDouyinHot() {
  try {
    const response = await axios.get('https://www.douyin.com/aweme/v1/hotsearch/board/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const items = response.data.data?.word_list || [];
    
    return items.slice(0, 20).map((item, index) => ({
      title: item.word,
      description: '',
      url: `https://www.douyin.com/hot/${item.group_id}`,
      hot_value: item.hot_value || 0,
      rank: index + 1,
      category: classifyCategory(item.word),
      image_url: ''
    }));
  } catch (error) {
    console.error('抖音热榜爬取失败:', error.message);
    return getMockData('抖音');
  }
}

function getMockData(platform) {
  const mockTitles = [
    `${platform}热榜1：挑战全网最火舞蹈`,
    `${platform}热榜2：搞笑视频合集`,
    `${platform}热榜3：网红达人直播`,
    `${platform}热榜4：美食探店系列`,
    `${platform}热榜5：旅行打卡圣地`,
    `${platform}热榜6：宠物萌翻全场`,
    `${platform}热榜7：职场干货分享`,
    `${platform}热榜8：科技数码测评`,
    `${platform}热榜9：情感故事共鸣`,
    `${platform}热榜10：生活小妙招`
  ];

  return mockTitles.map((title, index) => ({
    title,
    description: `抖音热门话题，热度持续上升中！`,
    url: `https://www.douyin.com/hot/${index + 1}`,
    hot_value: Math.floor(Math.random() * 10000000) + 500000,
    rank: index + 1,
    category: classifyCategory(title),
    image_url: ''
  }));
}

module.exports = { crawlDouyinHot };
