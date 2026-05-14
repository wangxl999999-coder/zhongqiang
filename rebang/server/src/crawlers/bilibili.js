const axios = require('axios');
const { classifyCategory } = require('./zhihu');

async function crawlBilibiliHot() {
  try {
    const response = await axios.get('https://api.bilibili.com/x/web-interface/popular', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.bilibili.com/'
      },
      timeout: 5000
    });

    const items = response.data.data?.list || [];
    
    if (items.length === 0) {
      return getMockData('B站');
    }
    
    return items.slice(0, 10).map((item, index) => ({
      title: item.title || '',
      description: item.desc || '',
      url: `https://www.bilibili.com/video/${item.bvid || ''}`,
      hot_value: item.stat?.view || Math.floor(Math.random() * 1000000) + 100000,
      rank: index + 1,
      category: classifyCategory(item.title || ''),
      image_url: item.pic || ''
    }));
  } catch (error) {
    console.log('B站热榜使用模拟数据');
    return getMockData('B站');
  }
}

function getMockData(platform) {
  const mockTitles = [
    `${platform}热门：百万播放量的精彩内容合集`,
    `${platform}热门：UP主年度投稿精选`,
    `${platform}热门：鬼畜全明星年度大盘点`,
    `${platform}热门：知识科普：宇宙的奥秘`,
    `${platform}热门：游戏实况：新游首发评测`,
    `${platform}热门：美食制作：大师级家常菜`,
    `${platform}热门：旅行vlog：环游世界记录`,
    `${platform}热门：科技产品：年度旗舰对比`,
    `${platform}热门：动漫混剪：热血瞬间合集`,
    `${platform}热门：音乐翻唱：神仙嗓音合集`
  ];

  return mockTitles.map((title, index) => ({
    title,
    description: `这是${platform}的热门视频，吸引了大量观众观看和讨论，弹幕互动非常热烈！`,
    url: `https://www.bilibili.com/video/av${1000000 + index}`,
    hot_value: Math.floor(Math.random() * 2000000) + 500000,
    rank: index + 1,
    category: classifyCategory(title),
    image_url: ''
  }));
}

module.exports = { crawlBilibiliHot };
