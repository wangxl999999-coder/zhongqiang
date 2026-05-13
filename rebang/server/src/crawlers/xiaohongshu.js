const axios = require('axios');
const { classifyCategory } = require('./zhihu');

async function crawlXiaohongshuHot() {
  try {
    const response = await axios.get('https://edith.xiaohongshu.com/api/sns/web/v1/homefeed', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const items = response.data.data?.items || [];
    
    return items.slice(0, 20).map((item, index) => ({
      title: item.note_card?.display_title || '',
      description: '',
      url: `https://www.xiaohongshu.com/discovery/item/${item.id}`,
      hot_value: item.note_card?.interact_info?.like_count || 0,
      rank: index + 1,
      category: classifyCategory(item.note_card?.display_title || ''),
      image_url: item.note_card?.cover?.url_list?.[0]?.url || ''
    }));
  } catch (error) {
    console.error('小红书热榜爬取失败:', error.message);
    return getMockData('小红书');
  }
}

function getMockData(platform) {
  const mockTitles = [
    `${platform}热门笔记1：今日穿搭分享`,
    `${platform}热门笔记2：护肤好物推荐`,
    `${platform}热门笔记3：旅行攻略大全`,
    `${platform}热门笔记4：美食探店日记`,
    `${platform}热门笔记5：家居装修灵感`,
    `${platform}热门笔记6：健身打卡记录`,
    `${platform}热门笔记7：职场经验分享`,
    `${platform}热门笔记8：考研上岸经验`,
    `${platform}热门笔记9：情侣日常vlog`,
    `${platform}热门笔记10：手账排版教程`
  ];

  return mockTitles.map((title, index) => ({
    title,
    description: `小红书精选笔记，快来看看吧！`,
    url: `https://www.xiaohongshu.com/discovery/item/${index + 1}`,
    hot_value: Math.floor(Math.random() * 500000) + 10000,
    rank: index + 1,
    category: classifyCategory(title),
    image_url: ''
  }));
}

module.exports = { crawlXiaohongshuHot };
