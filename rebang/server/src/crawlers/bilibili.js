const axios = require('axios');
const { classifyCategory } = require('./zhihu');

async function crawlBilibiliHot() {
  try {
    const response = await axios.get('https://api.bilibili.com/x/web-interface/popular', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const items = response.data.data?.list || [];
    
    return items.slice(0, 20).map((item, index) => ({
      title: item.title,
      description: item.desc || '',
      url: `https://www.bilibili.com/video/${item.bvid}`,
      hot_value: item.stat?.view || 0,
      rank: index + 1,
      category: classifyCategory(item.title),
      image_url: item.pic || ''
    }));
  } catch (error) {
    console.error('B站热榜爬取失败:', error.message);
    return getMockData('B站');
  }
}

function getMockData(platform) {
  const mockTitles = [
    `${platform}热门视频1：百万播放量的精彩内容`,
    `${platform}热门视频2：UP主最新投稿`,
    `${platform}热门视频3：鬼畜全明星`,
    `${platform}热门视频4：知识科普系列`,
    `${platform}热门视频5：游戏实况解说`,
    `${platform}热门视频6：美食制作教程`,
    `${platform}热门视频7：旅行vlog分享`,
    `${platform}热门视频8：科技产品评测`,
    `${platform}热门视频9：动漫混剪`,
    `${platform}热门视频10：音乐翻唱作品`
  ];

  return mockTitles.map((title, index) => ({
    title,
    description: `这是${platform}的热门视频，快来看看吧！`,
    url: `https://www.bilibili.com/video/av${1000000 + index}`,
    hot_value: Math.floor(Math.random() * 5000000) + 100000,
    rank: index + 1,
    category: classifyCategory(title),
    image_url: ''
  }));
}

module.exports = { crawlBilibiliHot };
